import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { handleApiError } from '@/lib/errors';
import { logger } from '@/lib/logger';
import type { ApiResponse } from '@/types';

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
});

export async function POST(request: Request) {
  const start = Date.now();
  try {
    const cookieToken = request.headers.get('cookie')?.match(/token=([^;]+)/)?.[1];
    const authHeader = request.headers.get('authorization');
    const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
    const token = bearerToken || cookieToken;

    if (!token) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    let payload;
    try {
      payload = await verifyToken(token);
    } catch {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validation = changePasswordSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: validation.error.issues[0].message },
        { status: 400 }
      );
    }
    const { currentPassword, newPassword } = validation.data;

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, password: true },
    });

    if (!user) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Current password is incorrect' },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    logger.info('Password changed', {
      method: 'POST',
      path: '/api/users/me/change-password',
      statusCode: 200,
      duration: Date.now() - start,
    });
    return NextResponse.json<ApiResponse>(
      { success: true, message: 'Password changed successfully' },
      { status: 200 }
    );
  } catch (error) {
    logger.error('Change password error', {
      method: 'POST',
      path: '/api/users/me/change-password',
      cause: error,
    });
    return handleApiError(error);
  }
}
