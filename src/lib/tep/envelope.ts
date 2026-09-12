import { randomUUID } from 'node:crypto';
import type { TepEnvelope } from './types.js';
import { PROTOCOL, VERSION } from './types.js';

export interface BuildEnvelopeInput {
  type: string;
  source: string;
  payload: Record<string, unknown>;
  correlation_id?: string;
  idempotency_key?: string;
  event_id?: string;
}

export function buildEnvelope(input: BuildEnvelopeInput): TepEnvelope {
  if (!input.type || typeof input.type !== 'string') throw new Error('type required');
  if (!input.source || typeof input.source !== 'string') throw new Error('source required');
  if (!input.payload || typeof input.payload !== 'object') throw new Error('payload must be an object');

  const envelope: TepEnvelope = {
    protocol: PROTOCOL,
    version: VERSION,
    event_id: input.event_id ?? randomUUID(),
    type: input.type,
    source: input.source,
    timestamp: new Date().toISOString(),
    payload: input.payload,
  };
  if (input.correlation_id !== undefined) envelope.correlation_id = input.correlation_id;
  if (input.idempotency_key !== undefined) envelope.idempotency_key = input.idempotency_key;
  return envelope;
}

export function serializeEnvelope(envelope: TepEnvelope): Buffer {
  const fields: string[] = [
    `{"protocol":${JSON.stringify(envelope.protocol)}`,
    `"version":${JSON.stringify(envelope.version)}`,
    `"event_id":${JSON.stringify(envelope.event_id)}`,
    `"type":${JSON.stringify(envelope.type)}`,
    `"source":${JSON.stringify(envelope.source)}`,
    `"timestamp":${JSON.stringify(envelope.timestamp)}`,
  ];
  if (envelope.correlation_id !== undefined) {
    fields.push(`"correlation_id":${JSON.stringify(envelope.correlation_id)}`);
  }
  if (envelope.idempotency_key !== undefined) {
    fields.push(`"idempotency_key":${JSON.stringify(envelope.idempotency_key)}`);
  }
  const payload = JSON.stringify(envelope.payload ?? {});
  fields.push(`"payload":${payload}}`);
  return Buffer.from(fields.join(','), 'utf8');
}

export function parseEnvelope(rawBody: Buffer): TepEnvelope {
  const data = JSON.parse(rawBody.toString('utf8')) as Partial<TepEnvelope>;
  if (data.protocol !== PROTOCOL) throw new Error(`protocol must be "${PROTOCOL}"`);
  if (data.version !== VERSION) throw new Error(`unsupported version "${data.version}"`);
  if (typeof data.event_id !== 'string') throw new Error('event_id (string) required');
  if (typeof data.type !== 'string') throw new Error('type (string) required');
  if (typeof data.source !== 'string') throw new Error('source (string) required');
  if (typeof data.timestamp !== 'string' || Number.isNaN(Date.parse(data.timestamp))) {
    throw new Error('timestamp must be a valid ISO8601 date');
  }
  if (!data.payload || typeof data.payload !== 'object') throw new Error('payload must be an object');
  return data as TepEnvelope;
}