import { TepHttpConsumer } from '@/lib/tep/consumer';
import { TepClient } from '@/lib/tep/client';
import { MemoryIdempotencyStore, type IdempotencyStore } from '@/lib/tep/idempotency';
import { logger } from '@/lib/logger';
import type { TepResult } from '@/lib/tep/types';

const TEP_SECRET = process.env.TEP_SECRET ?? '';
const TEP_KEY = process.env.TEP_KEY ?? 'nescom';
const TEP_SOURCE = process.env.TEP_SOURCE ?? 'nescom';
const TEP_PUSH_URL = process.env.TEP_PUSH_URL ?? '';

function isEnabled(): boolean {
  return TEP_SECRET.length >= 32;
}

function consumer(store?: IdempotencyStore): TepHttpConsumer | null {
  if (!isEnabled()) return null;
  const internal = new TepHttpConsumer({
    secret: TEP_SECRET,
    handler: async (envelope) => {
      logger.info(`TEP event ${envelope.type} received`, {
        method: 'POST',
        path: '/api/v1/events/push',
        statusCode: 200,
      });
      return {};
    },
    store: store ?? new MemoryIdempotencyStore(),
  });
  return internal;
}

function client(): TepClient | null {
  if (!isEnabled() || !TEP_PUSH_URL) return null;
  return new TepClient({
    url: new URL(TEP_PUSH_URL),
    secret: TEP_SECRET,
    key: TEP_KEY,
    source: TEP_SOURCE,
  });
}

export interface TepEmitInput {
  type: string;
  correlationId?: string;
  idempotencyKey?: string;
  payload: Record<string, unknown>;
}

/**
 * Publish a signed TEP event to the configured upstream consumer.
 * Returns null when TEP is not configured — safe no-op in production.
 */
export async function emitTepEvent(input: TepEmitInput): Promise<TepResult | null> {
  const tep = client();
  if (!tep) return null;
  try {
    return await tep.push({
      type: input.type,
      correlation_id: input.correlationId,
      idempotency_key: input.idempotencyKey,
      payload: input.payload,
    });
  } catch (err) {
    logger.warn(`TEP emit failed: ${String(err)}`);
    return null;
  }
}

/** Singleton consumer for route handlers (module cache survives HMR in next dev). */
const globalForTep = globalThis as unknown as { tepConsumer?: TepHttpConsumer | null };

export function getTepConsumer(): TepHttpConsumer | null {
  if (!isEnabled()) return null;
  if (!globalForTep.tepConsumer) globalForTep.tepConsumer = consumer();
  return globalForTep.tepConsumer;
}

export const tepConfig = { isEnabled, TEP_KEY, TEP_SOURCE, TEP_PUSH_URL };
