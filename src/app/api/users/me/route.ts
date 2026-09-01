import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { handleApiError } from '@/lib/errors';
import { logger } from '@/lib/logger';
import type { ApiResponse, User } from '@/types';

export async function GET(request: Request) {
  const start = Date.now();
  try {
    const authHeader = request.headers.get('authorization');
    const cookieToken = request.headers.get('cookie')?.match(/token=([^;]+)/)?.[1];
    const token = authHeader?.replace('Bearer ', '') || cookieToken;

    if (!token) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'No token provided' },
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

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        companyId: true,
        avatar: true,
        phone: true,
        salary: true,
        salaryDueDate: true,
        startDate: true,
      },
    });

    if (!user) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    const typedUser: User = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      companyId: user.companyId,
      avatar: user.avatar ?? null,
      phone: user.phone ?? null,
      salary: user.salary ?? null,
      salaryDueDate: user.salaryDueDate?.toISOString() ?? null,
      startDate: user.startDate?.toISOString() ?? null,
      createdAt: '',
    };

    logger.info('Current user fetched', {
      method: 'GET',
      path: '/api/users/me',
      statusCode: 200,
      duration: Date.now() - start,
    });
    return NextResponse.json<ApiResponse<{ user: User }>>({
      success: true,
      data: { user: typedUser },
    });
  } catch (error) {
    logger.error('Get user error', { method: 'GET', path: '/api/users/me', cause: error });
    return handleApiError(error);
  }
}
