import { createHmac, timingSafeEqual } from 'node:crypto';
import type { TepEnvelope } from './types.js';
import { VERSION } from './types.js';

const SIG_PREFIX = 'v1.';

export function canonical(envelope: TepEnvelope, rawBody: Buffer): Buffer {
  const parts = [
    'tep',
    VERSION,
    envelope.event_id,
    envelope.timestamp,
    envelope.source,
    envelope.type,
    rawBody.toString('utf8'),
  ];
  return Buffer.from(parts.join('\n'), 'utf8');
}

export function sign(envelope: TepEnvelope, rawBody: Buffer, secret: string): string {
  return SIG_PREFIX + createHmac('sha256', secret).update(canonical(envelope, rawBody)).digest('base64url');
}

export function verify(envelope: TepEnvelope, rawBody: Buffer, signature: string, secret: string): boolean {
  try {
    if (typeof signature !== 'string' || !signature.startsWith(SIG_PREFIX)) {
      return false;
    }
    const provided = Buffer.from(signature.slice(SIG_PREFIX.length), 'base64url');
    const expected = createHmac('sha256', secret).update(canonical(envelope, rawBody)).digest();
    if (provided.length !== expected.length) {
      return false;
    }
    return timingSafeEqual(provided, expected);
  } catch {
    return false;
  }
}