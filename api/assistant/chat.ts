import type { VercelRequest, VercelResponse } from '@vercel/node';

import { createCompletion, normalizeHistory } from '../_lib/anthropic.js';
import { ApiError, handleApiError, parseJsonBody, sendApiError, sendJson } from '../_lib/http.js';
import { buildChatSystemPrompt } from '../_lib/prompts.js';
import { chatRequestSchema } from '../_lib/schemas.js';

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (req.method !== 'POST') {
    sendApiError(res, 405, 'METHOD_NOT_ALLOWED', 'Use POST for this endpoint.', false);
    return;
  }

  try {
    const body = parseJsonBody<unknown>(req.body);
    const parsed = chatRequestSchema.safeParse(body);

    if (!parsed.success) {
      throw new ApiError(
        400,
        'BAD_REQUEST',
        'Chat request is invalid.',
        false,
        parsed.error.issues.map((issue) => `${issue.path.join('.') || 'root'}: ${issue.message}`)
      );
    }

    const completion = await createCompletion({
      messages: [
        { role: 'system', content: buildChatSystemPrompt(parsed.data) },
        ...normalizeHistory(parsed.data.chatHistory),
        { role: 'user', content: parsed.data.userMessage }
      ],
      language: parsed.data.language,
      maxCompletionTokens: 320
    });

    sendJson(res, 200, {
      reply: completion.content,
      meta: completion.meta
    });
  } catch (error) {
    handleApiError(res, error);
  }
}
