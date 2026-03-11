import type { VercelResponse } from '@vercel/node';

import type {
  AssistantApiErrorBody,
  AssistantApiErrorCode
} from '../../src/shared/assistant-contract';

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: AssistantApiErrorCode,
    message: string,
    public readonly retryable = false,
    public readonly details?: string[]
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function parseJsonBody<T>(body: unknown): T {
  if (typeof body === 'string') {
    return JSON.parse(body) as T;
  }

  return body as T;
}

export function sendJson(res: VercelResponse, status: number, payload: unknown): void {
  res.status(status).setHeader('Content-Type', 'application/json; charset=utf-8').send(payload);
}

export function sendApiError(
  res: VercelResponse,
  status: number,
  code: AssistantApiErrorCode,
  message: string,
  retryable = false,
  details?: string[]
): void {
  const error: AssistantApiErrorBody = {
    code,
    message,
    retryable,
    ...(details && details.length > 0 ? { details } : {})
  };

  sendJson(res, status, { error });
}

export function handleApiError(res: VercelResponse, error: unknown): void {
  if (error instanceof ApiError) {
    sendApiError(res, error.status, error.code, error.message, error.retryable, error.details);
    return;
  }

  const message = error instanceof Error ? error.message : 'Unexpected server error.';
  sendApiError(res, 500, 'PROVIDER', message, true);
}
