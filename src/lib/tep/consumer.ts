import type { IncomingMessage, ServerResponse } from 'node:http';
import { parseEnvelope } from './envelope.js';
import { verify } from './signature.js';
import { MemoryIdempotencyStore, type IdempotencyRecord, type IdempotencyStore } from './idempotency.js';
import { HTTP_STATUS } from './errors.js';
import type { TepEnvelope, TepResult } from './types.js';

export type EventHandler = (envelope: TepEnvelope) => Promise<Partial<TepResult> | void>;

export interface TepConsumerOptions {
  secret: string;
  handler: EventHandler;
  store?: IdempotencyStore;
}

export interface TepHeaders {
  version?: string;
  key?: string;
  signature?: string;
}

function statusToResult(record: IdempotencyRecord, eventId: string): TepResult {
  return {
    code: record.status === 'failed' ? 'UPSTREAM_ERROR' : 'DUPLICATE_EVENT',
    event_id: eventId,
    status: record.status,
    error: record.error,
    httpStatus: record.status === 'failed' ? 502 : 200,
  };
}

export class TepHttpConsumer {
  private readonly secret: string;
  private readonly handler: EventHandler;
  private readonly store: IdempotencyStore;

  constructor(options: TepConsumerOptions) {
    if (options.secret.length < 32) throw new Error('TEP secret must be at least 32 bytes');
    this.secret = options.secret;
    this.handler = options.handler;
    this.store = options.store ?? new MemoryIdempotencyStore();
  }

  async handle(headers: TepHeaders, rawBody: Buffer): Promise<TepResult> {
    const { version, key, signature } = headers;

    if (!signature) {
      return { httpStatus: HTTP_STATUS.SIG_INVALID, code: 'SIG_INVALID', error: 'missing signature header' };
    }

    let envelope: TepEnvelope;
    try {
      if (rawBody.length === 0) throw new Error('empty body');
      envelope = parseEnvelope(rawBody);
    } catch (err) {
      return { httpStatus: HTTP_STATUS.BAD_REQUEST, code: 'BAD_REQUEST', error: String(err) };
    }

    if (!version || version !== envelope.version) {
      return {
        httpStatus: HTTP_STATUS.VERSION_UNSUPPORTED,
        code: 'VERSION_UNSUPPORTED',
        error: `expected version ${envelope.version}`,
      };
    }
    if (!key || key.length === 0) {
      return { httpStatus: HTTP_STATUS.SIG_INVALID, code: 'SIG_INVALID', error: 'missing key header' };
    }

    const signatureOk = verify(envelope, rawBody, signature, this.secret);
    if (!signatureOk) {
      return { httpStatus: HTTP_STATUS.SIG_INVALID, code: 'SIG_INVALID', error: 'signature verification failed' };
    }

    const dedupeKey = envelope.idempotency_key ?? envelope.event_id;
    const existing = this.store.get(dedupeKey);
    if (existing) {
      return statusToResult(existing, envelope.event_id);
    }

    this.store.set(dedupeKey, { status: 'received' });
    if (dedupeKey !== envelope.event_id) {
      this.store.set(envelope.event_id, { status: 'received' });
    }

    try {
      const result = await this.handler(envelope);
      const record: IdempotencyRecord = {
        status: result?.code === 'EVENT_ACCEPTED' ? 'processing' : 'delivered',
        processedAt: new Date().toISOString(),
        error: result?.error ?? undefined,
      };
      this.store.set(dedupeKey, record);
      if (dedupeKey !== envelope.event_id) {
        this.store.set(envelope.event_id, record);
      }
      const code = result?.code ?? 'OK';
      return {
        httpStatus: HTTP_STATUS[code] ?? 200,
        code,
        event_id: envelope.event_id,
        status: record.status,
        error: record.error,
      };
    } catch (err) {
      const record: IdempotencyRecord = { status: 'failed', error: String(err) };
      this.store.set(dedupeKey, record);
      return statusToResult(record, envelope.event_id);
    }
  }

  getEvent(eventId: string): TepResult {
    const record = this.store.get(eventId);
    if (!record) {
      return { httpStatus: HTTP_STATUS.EVENT_NOT_FOUND, code: 'EVENT_NOT_FOUND', event_id: eventId, error: null };
    }
    return {
      httpStatus: 200,
      code: record.status === 'failed' ? 'UPSTREAM_ERROR' : 'OK',
      event_id: eventId,
      status: record.status,
      processed_at: record.processedAt,
      error: record.error,
    };
  }

  async pushEndpoint(req: IncomingMessage, res: ServerResponse): Promise<void> {
    const headers: TepHeaders = {
      version: stringHeader(req.headers['x-tep-version']),
      key: stringHeader(req.headers['x-tep-key']),
      signature: stringHeader(req.headers['x-tep-signature']),
    };
    const rawBody = await readBody(req);
    const result = await this.handle(headers, rawBody);
    sendJson(res, result.httpStatus ?? 502, result);
  }

  async statusEndpoint(_req: IncomingMessage, res: ServerResponse, eventId: string): Promise<void> {
    const result = this.getEvent(eventId);
    sendJson(res, result.httpStatus ?? 502, result);
  }
}

function stringHeader(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

async function readBody(req: IncomingMessage): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

function sendJson(res: ServerResponse, status: number, body: unknown): void {
  res.statusCode = status;
  res.setHeader('content-type', 'application/json');
  res.end(JSON.stringify(body));
}