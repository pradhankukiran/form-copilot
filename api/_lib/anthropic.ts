import Groq from 'groq-sdk';

import type { AssistantChatMessage, AssistantResponseMeta, SupportedLanguage } from '../../src/shared/assistant-contract';
import { ApiError } from './http';

type CompletionMessage =
  | { role: 'system'; content: string }
  | { role: 'user'; content: string }
  | { role: 'assistant'; content: string };

interface CompletionOptions {
  messages: CompletionMessage[];
  language: SupportedLanguage;
  maxCompletionTokens: number;
  temperature?: number;
}

interface EnvConfig {
  apiKey?: string;
  model: string;
}

function readEnv(options?: { requireApiKey?: boolean }): EnvConfig {
  const apiKey = process.env.GROQ_API_KEY?.trim();
  const model = process.env.GROQ_MODEL?.trim() || 'openai/gpt-oss-120b';

  if (options?.requireApiKey !== false && !apiKey) {
    throw new ApiError(500, 'UNAUTHORIZED', 'GROQ_API_KEY is not configured.', false);
  }

  return { apiKey, model };
}

export function getResponseMeta(language: SupportedLanguage): AssistantResponseMeta {
  const env = readEnv({ requireApiKey: false });

  return {
    provider: 'groq',
    model: env.model,
    language
  };
}

let cachedClient: Groq | null = null;
let cachedClientKey: string | null = null;

function getClient(): { client: Groq; config: EnvConfig } {
  const config = readEnv({ requireApiKey: true });
  const cacheKey = `${config.model}::${config.apiKey}`;

  if (!cachedClient || cachedClientKey !== cacheKey) {
    cachedClient = new Groq({
      apiKey: config.apiKey,
      maxRetries: 2,
      timeout: 30_000
    });
    cachedClientKey = cacheKey;
  }

  return { client: cachedClient, config };
}

function toProviderError(error: unknown): never {
  if (error instanceof Groq.APIError) {
    if (error.status === 429) {
      throw new ApiError(
        503,
        'PROVIDER',
        'The AI service is experiencing high traffic right now. Please try again in a few moments.',
        true
      );
    }

    throw new ApiError(
      error.status ?? 502,
      'PROVIDER',
      error.message || 'Groq returned an error response.',
      (error.status ?? 500) >= 500 || error.status === 429
    );
  }

  if (error instanceof Error) {
    throw new ApiError(502, 'PROVIDER', error.message, true);
  }

  throw new ApiError(502, 'PROVIDER', 'Unable to reach the AI service right now.', true);
}

interface JsonCompletionOptions {
  system: string;
  userMessage: string;
  language: SupportedLanguage;
  maxCompletionTokens: number;
  temperature?: number;
}

export async function createJsonCompletion({
  system,
  userMessage,
  language,
  maxCompletionTokens,
  temperature = 0.2
}: JsonCompletionOptions): Promise<{ input: Record<string, unknown>; meta: AssistantResponseMeta }> {
  const { client, config } = getClient();

  try {
    const response = await client.chat.completions.create({
      model: config.model,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: userMessage }
      ],
      max_completion_tokens: maxCompletionTokens,
      temperature,
      response_format: { type: 'json_object' }
    });

    const raw = response.choices[0]?.message?.content?.trim();
    if (!raw) {
      throw new ApiError(502, 'INVALID_RESPONSE', 'Groq returned an empty response.', true);
    }

    const input = JSON.parse(raw);

    return {
      input,
      meta: {
        provider: 'groq',
        model: config.model,
        language
      }
    };
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    if (error instanceof SyntaxError) {
      throw new ApiError(502, 'INVALID_RESPONSE', 'Groq returned invalid JSON.', true);
    }
    toProviderError(error);
  }
}

export async function createCompletion({
  messages,
  language,
  maxCompletionTokens,
  temperature = 0.2
}: CompletionOptions): Promise<{ content: string; meta: AssistantResponseMeta }> {
  const { client, config } = getClient();

  const groqMessages = messages.map((m) => ({
    role: m.role as 'system' | 'user' | 'assistant',
    content: m.content
  }));

  try {
    const response = await client.chat.completions.create({
      model: config.model,
      messages: groqMessages,
      max_completion_tokens: maxCompletionTokens,
      temperature
    });

    const content = response.choices[0]?.message?.content?.trim();

    if (!content) {
      throw new ApiError(502, 'INVALID_RESPONSE', 'Groq returned an empty response.', true);
    }

    return {
      content,
      meta: {
        provider: 'groq',
        model: config.model,
        language
      }
    };
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    toProviderError(error);
  }
}

export function normalizeHistory(history: AssistantChatMessage[]): CompletionMessage[] {
  return history.map((turn) => ({
    role: turn.role,
    content: turn.content
  }));
}
