import { NextResponse } from 'next/server';
import { getTepConsumer, tepConfig } from '@/lib/tep-config';
import { logger } from '@/lib/logger';
import type { ApiResponse } from '@/types';

export async function GET(_request: Request, { params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = await params;
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

  const result = consumer.getEvent(eventId);

  const duration = Date.now() - start;
  logger.info('TEP event status', {
    method: 'GET',
    path: `/api/v1/events/${eventId}`,
    statusCode: result.httpStatus ?? 502,
    duration,
  });

  return NextResponse.json<
    ApiResponse<{ code: string; event_id?: string; status?: string; processed_at?: string }>
  >(
    {
      success: result.httpStatus === 200,
      data: {
        code: result.code,
        event_id: result.event_id,
        status: result.status,
        processed_at: result.processed_at,
      },
      error: result.error ?? undefined,
    },
    { status: result.httpStatus ?? 502 }
  );
}
