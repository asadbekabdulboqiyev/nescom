import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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

  return NextResponse.json(
    {
      status: dbStatus === 'connected' ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      version: '0.1.0',
      db: dbStatus,
      responseTime: `${responseTime}ms`,
    },
    {
      headers: { 'Cache-Control': 'no-store' },
    }
  );
}
