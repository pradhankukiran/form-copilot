import type { VercelRequest, VercelResponse } from '@vercel/node';

import { getResponseMeta } from './_lib/anthropic';
import { sendApiError, sendJson } from './_lib/http';

export default function handler(req: VercelRequest, res: VercelResponse): void {
  if (req.method !== 'GET') {
    sendApiError(res, 405, 'METHOD_NOT_ALLOWED', 'Use GET for this endpoint.', false);
    return;
  }

  const meta = getResponseMeta('en');

  sendJson(res, 200, {
    ok: true,
    provider: meta.provider,
    model: meta.model,
    timestamp: new Date().toISOString()
  });
}
