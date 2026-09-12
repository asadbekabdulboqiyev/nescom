import { buildEnvelope, serializeEnvelope, type BuildEnvelopeInput } from './envelope.js';
import { sign } from './signature.js';
import { TepError } from './errors.js';
import type { TepEnvelope, TepResult } from './types.js';

export type TepClientPushInput = Omit<BuildEnvelopeInput, 'source'>;

export interface TepClientOptions {
  url: URL;
  secret: string;
  key: string;
  source: string;
  maxRetries?: number;
  baseDelayMs?: number;
  maxDelayMs?: number;
}

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

export class TepClient {
  private readonly url: URL;
  private readonly secret: string;
  private readonly key: string;
  private readonly source: string;
  private readonly maxRetries: number;
  private readonly baseDelayMs: number;
  private readonly maxDelayMs: number;

  constructor(options: TepClientOptions) {
    if (options.secret.length < 32) throw new Error('TEP secret must be at least 32 bytes');
    this.url = options.url;
    this.secret = options.secret;
    this.key = options.key;
    this.source = options.source;
    this.maxRetries = options.maxRetries ?? 5;
    this.baseDelayMs = options.baseDelayMs ?? 1000;
    this.maxDelayMs = options.maxDelayMs ?? 60000;
  }

  async push(input: TepClientPushInput): Promise<TepResult> {
    const envelope: TepEnvelope = buildEnvelope({ ...input, source: this.source });
    const rawBody = serializeEnvelope(envelope);
    const signature = sign(envelope, rawBody, this.secret);

    let lastError: unknown;
    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      if (attempt > 0) {
        const delay = Math.min(this.baseDelayMs * 2 ** (attempt - 1), this.maxDelayMs);
        await sleep(delay);
      }
      try {
        const res = await fetch(this.url, {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            'x-tep-version': envelope.version,
            'x-tep-key': this.key,
            'x-tep-signature': signature,
          },
          body: new Uint8Array(rawBody),
        });
        const result = (await res.json()) as TepResult;
        result.httpStatus = res.status;
        if (res.status >= 200 && res.status < 300) return result;
        lastError = result;
      } catch (err) {
        lastError = err;
      }
    }
    throw new TepError('UPSTREAM_ERROR', `TEP push failed after ${this.maxRetries + 1} attempts: ${String(lastError)}`);
  }
}