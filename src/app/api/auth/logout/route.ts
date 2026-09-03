import { NextResponse } from 'next/server';
import { handleApiError } from '@/lib/errors';
import { logger } from '@/lib/logger';
import type { ApiResponse } from '@/types';

export async function POST() {
  const start = Date.now();
  try {
    const response = NextResponse.json<ApiResponse>(
      { success: true, message: 'Logged out' },
      { status: 200 }
    );
    response.cookies.set('token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0,
      path: '/',
    });
    logger.info('User logged out', {
      method: 'POST',
      path: '/api/auth/logout',
      statusCode: 200,
      duration: Date.now() - start,
    });
    return response;
  } catch (error) {
    logger.error('Logout error', { method: 'POST', path: '/api/auth/logout', cause: error });
    return handleApiError(error);
  }
}
