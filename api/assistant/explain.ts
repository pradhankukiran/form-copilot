import type { VercelRequest, VercelResponse } from '@vercel/node';

import { createJsonCompletion } from '../_lib/anthropic.js';
import { ApiError, handleApiError, parseJsonBody, sendApiError, sendJson } from '../_lib/http.js';
import { buildExplainPrompt } from '../_lib/prompts.js';
import { explainRequestSchema, explanationSchema } from '../_lib/schemas.js';

const jsonSchemaInstruction = [
  'Respond with a JSON object containing exactly these keys:',
  '- whatThisMeans (string): A plain-language explanation of what the field is asking.',
  '- whyAsked (string): Why the form includes this field.',
  '- whatToEnter (string): Guidance on what the user should type or select.',
  '- examples (string[]): Up to 4 example values or phrases.',
  '- commonMistakes (string[]): Up to 4 common mistakes to avoid.',
  '- disclaimer (string): A short reminder that this assistant does not provide legal or compliance advice.'
].join('\n');

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (req.method !== 'POST') {
    sendApiError(res, 405, 'METHOD_NOT_ALLOWED', 'Use POST for this endpoint.', false);
    return;
  }

  try {
    const body = parseJsonBody<unknown>(req.body);
    const parsed = explainRequestSchema.safeParse(body);

    if (!parsed.success) {
      throw new ApiError(
        400,
        'BAD_REQUEST',
        'Explain request is invalid.',
        false,
        parsed.error.issues.map((issue) => `${issue.path.join('.') || 'root'}: ${issue.message}`)
      );
    }

    const prompt = buildExplainPrompt(parsed.data);
    const result = await createJsonCompletion({
      system: prompt.system,
      userMessage: [prompt.user, '', jsonSchemaInstruction].join('\n'),
      language: parsed.data.language,
      maxCompletionTokens: 900
    });

    const validated = explanationSchema.safeParse(result.input);
    if (!validated.success) {
      throw new ApiError(
        502,
        'INVALID_RESPONSE',
        'The assistant returned the explanation in an unexpected format. Please try again.',
        true
      );
    }

    sendJson(res, 200, {
      explanation: validated.data,
      meta: result.meta
    });
  } catch (error) {
    handleApiError(res, error);
  }
}
