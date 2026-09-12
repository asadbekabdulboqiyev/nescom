import type { TepCode, TepResult } from './types.js';

export const HTTP_STATUS: Record<TepCode, number> = {
  OK: 200,
  EVENT_ACCEPTED: 202,
  BAD_REQUEST: 400,
  SIG_INVALID: 401,
  VERSION_UNSUPPORTED: 415,
  DUPLICATE_EVENT: 200,
  EVENT_NOT_FOUND: 404,
  UPSTREAM_ERROR: 502,
};

export class TepError extends Error {
  readonly code: TepCode;
  readonly httpStatus: number;

  constructor(code: TepCode, message: string) {
    super(message);
    this.name = 'TepError';
    this.code = code;
    this.httpStatus = HTTP_STATUS[code] ?? 500;
  }

  toResult(eventId?: string): TepResult {
    return {
      code: this.code,
      event_id: eventId,
      error: this.message,
      httpStatus: this.httpStatus,
    };
  }
}