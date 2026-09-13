import { TepHttpConsumer } from '@/lib/tep/consumer';
import { TepClient } from '@/lib/tep/client';
import { sign } from '@/lib/tep/signature';
import { serializeEnvelope } from '@/lib/tep/envelope';
import { buildEnvelope } from '@/lib/tep/envelope';
import { MemoryIdempotencyStore } from '@/lib/tep/idempotency';

const SECRET = '0123456789abcdef0123456789abcdef';

describe('TEP integration handlers', () => {
  it('consumer.handle accepts a valid signed event and reports OK', async () => {
    let handled: string | null = null;
    const consumer = new TepHttpConsumer({
      secret: SECRET,
      handler: async (envelope) => {
        handled = envelope.type;
        return {};
      },
    });

    const envelope = buildEnvelope({
      type: 'company.updated',
      source: 'nescom',
      idempotency_key: 'company-1',
      payload: { company_id: '1', name: 'TechCorp' },
    });
    const rawBody = serializeEnvelope(envelope);
    const signature = sign(envelope, rawBody, SECRET);

    const result = await consumer.handle(
      { version: envelope.version, key: 'nescom', signature },
      rawBody
    );

    expect(result.code).toBe('OK');
    expect(result.httpStatus).toBe(200);
    expect(handled).toBe('company.updated');

    const status = consumer.getEvent(envelope.event_id);
    expect(status.status).toBe('delivered');
  });

  it('consumer.handle rejects a tampered signature', async () => {
    const consumer = new TepHttpConsumer({ secret: SECRET, handler: async () => ({}) });

    const envelope = buildEnvelope({
      type: 'salary.paid',
      source: 'nescom',
      payload: { amount: 100 },
    });
    const rawBody = serializeEnvelope({ ...envelope, payload: { amount: 99999 } });
    const signature = sign(envelope, serializeEnvelope(envelope), SECRET);

    const result = await consumer.handle(
      { version: envelope.version, key: 'nescom', signature },
      rawBody
    );

    expect(result.code).toBe('SIG_INVALID');
    expect(result.httpStatus).toBe(401);
  });

  it('consumer.handle dedupes retries with the same idempotency_key', async () => {
    let count = 0;
    const consumer = new TepHttpConsumer({
      secret: SECRET,
      handler: async () => {
        count += 1;
        return {};
      },
    });

    const envelope = buildEnvelope({
      type: 'task.created',
      source: 'nescom',
      idempotency_key: 'task-77',
      payload: { title: 'TEP test' },
    });
    const rawBody = serializeEnvelope(envelope);
    const signature = sign(envelope, rawBody, SECRET);
    const headers = { version: envelope.version, key: 'nescom', signature };

    const first = await consumer.handle(headers, rawBody);
    const second = await consumer.handle(headers, rawBody);

    expect(first.code).toBe('OK');
    expect(second.code).toBe('DUPLICATE_EVENT');
    expect(count).toBe(1);
  });

  it('emit path round-trips: client.push → consumer.handle', async () => {
    const consumer = new TepHttpConsumer({
      secret: SECRET,
      handler: async () => ({}),
    });

    let receivedRawBody: Buffer | null = null;
    let receivedSig = '';
    let receivedVersion = '';
    const client = new TepClient({
      url: new URL('http://tep.local/api/v1/events/push'),
      secret: SECRET,
      key: 'nescom',
      source: 'nescom',
      maxRetries: 0,
    });

    const originalFetch = globalThis.fetch;
    globalThis.fetch = (async (
      _input: RequestInfo | URL,
      init?: RequestInit
    ): Promise<Response> => {
      receivedRawBody = Buffer.from(init?.body as ArrayBuffer);
      const headers = (init?.headers as Record<string, string>) ?? {};
      receivedSig = headers['x-tep-signature'] ?? '';
      receivedVersion = headers['x-tep-version'] ?? '';
      const result = await consumer.handle(
        {
          version: receivedVersion,
          key: 'nescom',
          signature: receivedSig,
        },
        receivedRawBody
      );
      return {
        status: result.httpStatus ?? 500,
        json: async () => result,
      } as Response;
    }) as typeof fetch;

    try {
      const result = await client.push({
        type: 'company.updated',
        idempotency_key: 'cmp-9',
        payload: { id: 9 },
      });
      expect(result.code).toBe('OK');
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it('MemoryIdempotencyStore evicts expired entries', () => {
    const store = new MemoryIdempotencyStore(-1);
    store.set('k', { status: 'received' });
    expect(store.get('k')).toBeUndefined();
  });
});
