import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { ApiResponse } from '@/types';

interface HealthData {
  status: string;
  timestamp: string;
  version: string;
  db: string;
  responseTime: string;
}

export async function GET() {
  const start = Date.now();

  let dbStatus = 'disconnected';
  try {
    await prisma.$queryRaw`SELECT 1`;
    dbStatus = 'connected';
  } catch {
    dbStatus = 'disconnected';
  }

  const responseTime = Date.now() - start;

  const data: HealthData = {
    status: dbStatus === 'connected' ? 'ok' : 'degraded',
    timestamp: new Date().toISOString(),
    version: '0.1.0',
    db: dbStatus,
    responseTime: `${responseTime}ms`,
  };

  return NextResponse.json<ApiResponse<HealthData>>(
    { success: true, data },
    {
      headers: { 'Cache-Control': 'no-store' },
    }
  );
}
