import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { signToken } from '@/lib/auth';
import { loginSchema, validateRequest } from '@/lib/validation';
import { recordLoginFailure, resetLoginFailures } from '@/middleware';
import { handleApiError } from '@/lib/errors';
import { logger } from '@/lib/logger';
import type { ApiResponse } from '@/types';

interface LoginResponse {
  token: string;
  user: { id: string; email: string; name: string; role: string; companyId: string };
}

export async function POST(request: Request) {
  const start = Date.now();
  try {
    const body = await request.json();
    const validation = validateRequest(loginSchema, body);

    if (!validation.success) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: validation.error },
        { status: 400 }
      );
    }

    const { email, password } = validation.data;

    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded?.split(',')[0] || 'unknown';
    const loginKey = `${ip}:${email}`;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      recordLoginFailure(loginKey);
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      recordLoginFailure(loginKey);
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    resetLoginFailures(loginKey);

    if (user.role === 'PENDING') {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error:
            'Your account is pending approval. Please wait for the company admin to approve your request.',
        },
        { status: 403 }
      );
    }

    const token = await signToken({
      userId: user.id,
      email: user.email,
      companyId: user.companyId,
      role: user.role,
    });

    const data: LoginResponse = {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        companyId: user.companyId,
      },
    };

    const response = NextResponse.json<ApiResponse<LoginResponse>>(
      { success: true, data },
      { status: 200 }
    );

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    logger.info('User logged in', {
      method: 'POST',
      path: '/api/auth/login',
      statusCode: 200,
      duration: Date.now() - start,
    });
    return response;
  } catch (error) {
    logger.error('Login error', { method: 'POST', path: '/api/auth/login', cause: error });
    return handleApiError(error);
  }
}
