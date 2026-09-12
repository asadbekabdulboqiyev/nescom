export const PROTOCOL = 'tep';
export const VERSION = '1.0';

export type TepStatus = 'received' | 'processing' | 'delivered' | 'failed';

export type TepCode =
  | 'OK'
  | 'EVENT_ACCEPTED'
  | 'BAD_REQUEST'
  | 'SIG_INVALID'
  | 'VERSION_UNSUPPORTED'
  | 'DUPLICATE_EVENT'
  | 'EVENT_NOT_FOUND'
  | 'UPSTREAM_ERROR';

export interface TepEnvelope {
  protocol: typeof PROTOCOL;
  version: typeof VERSION;
  event_id: string;
  type: string;
  source: string;
  timestamp: string;
  correlation_id?: string;
  idempotency_key?: string;
  payload: Record<string, unknown>;
}

export interface TepResult {
  code: TepCode;
  event_id?: string;
  status?: TepStatus;
  error?: string | null;
  processed_at?: string;
  httpStatus?: number;
}

/** Canonical signed payload: entire JSON envelope body (raw bytes). */
export type TepCanonicalPayload = Buffer;