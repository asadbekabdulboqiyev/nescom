import type { TepStatus } from './types.js';

export interface IdempotencyRecord {
  status: TepStatus;
  processedAt?: string;
  error?: string;
}

export interface IdempotencyStore {
  get(key: string): IdempotencyRecord | undefined;
  set(key: string, record: IdempotencyRecord): void;
}

export const IDEMPOTENCY_TTL_MS = 24 * 60 * 60 * 1000;

interface Entry {
  record: IdempotencyRecord;
  expiresAt: number;
}

export class MemoryIdempotencyStore implements IdempotencyStore {
  private readonly map = new Map<string, Entry>();

  constructor(private readonly ttlMs: number = IDEMPOTENCY_TTL_MS) {}

  get(key: string): IdempotencyRecord | undefined {
    const entry = this.map.get(key);
    if (!entry) return undefined;
    if (entry.expiresAt < Date.now()) {
      this.map.delete(key);
      return undefined;
    }
    return entry.record;
  }

  set(key: string, record: IdempotencyRecord): void {
    this.map.set(key, { record, expiresAt: Date.now() + this.ttlMs });
  }
}