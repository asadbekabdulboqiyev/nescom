import { NextResponse } from 'next/server';
import { getTepConsumer, tepConfig } from '@/lib/tep-config';
import { logger } from '@/lib/logger';
import type { ApiResponse } from '@/types';

export async function POST(request: Request) {
  const start = Date.now();

  if (!tepConfig.isEnabled()) {
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'TEP is not configured' },
      { status: 503 }
    );
  }

  const consumer = getTepConsumer();
  if (!consumer) {
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'TEP unavailable' },
      { status: 500 }
    );
  }

  const version = request.headers.get('x-tep-version') ?? undefined;
  const key = request.headers.get('x-tep-key') ?? undefined;
  const signature = request.headers.get('x-tep-signature') ?? undefined;

  if (!signature) {
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'missing x-tep-signature header' },
      { status: 400 }
    );
  }

  let rawBody: Buffer;
  try {
    const arrayBuf = await request.arrayBuffer();
    rawBody = Buffer.from(arrayBuf);
    if (rawBody.length === 0) throw new Error('empty body');
  } catch {
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'invalid request body' },
      { status: 400 }
    );
  }

  const result = await consumer.handle({ version, key, signature }, rawBody);

  const duration = Date.now() - start;
  logger.info('TEP event processed', {
    method: 'POST',
    path: '/api/v1/events/push',
    statusCode: result.httpStatus ?? 502,
    duration,
  });

  return NextResponse.json<ApiResponse<{ code: string; event_id?: string; status?: string }>>(
    {
      success: result.httpStatus !== undefined && result.httpStatus < 400,
      data: {
        code: result.code,
        event_id: result.event_id,
        status: result.status,
      },
      error: result.error ?? undefined,
    },
    { status: result.httpStatus ?? 502 }
  );
}
