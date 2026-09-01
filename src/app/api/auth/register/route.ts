import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { signToken } from '@/lib/auth';
import { registerSchema, validateRequest } from '@/lib/validation';
import { handleApiError } from '@/lib/errors';
import { logger } from '@/lib/logger';
import type { ApiResponse } from '@/types';

interface RegisterResponse {
  user: { id: string; email: string; name: string; role: string };
  token: string;
  pending?: boolean;
}

export async function POST(request: Request) {
  const start = Date.now();
  try {
    const body = await request.json();
    const validation = validateRequest(registerSchema, body);

    if (!validation.success) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: validation.error },
        { status: 400 }
      );
    }

    const { email, password, name, companyId } = validation.data;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Email already registered' },
        { status: 409 }
      );
    }

    let targetCompanyId = companyId;

    if (!targetCompanyId) {
      const firstCompany = await prisma.company.findFirst({
        orderBy: { createdAt: 'asc' },
      });
      if (!firstCompany) {
        return NextResponse.json<ApiResponse>(
          { success: false, error: 'Company not found. Please create a company first.' },
          { status: 400 }
        );
      }
      targetCompanyId = firstCompany.id;
    }

    const company = await prisma.company.findUnique({
      where: { id: targetCompanyId },
    });
    if (!company) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Company not found' },
        { status: 404 }
      );
    }

    const userCount = await prisma.user.count({
      where: { companyId: targetCompanyId },
    });

    const isFirstUser = userCount === 0;
    const hashedPassword = await bcrypt.hash(password, 10);

    if (isFirstUser) {
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          role: 'CEO',
          companyId: targetCompanyId,
        },
      });

      const token = await signToken({
        userId: user.id,
        email: user.email,
        companyId: user.companyId,
        role: user.role,
      });

      const data: RegisterResponse = {
        user: { id: user.id, email: user.email, name: user.name, role: user.role },
        token,
      };

      const response = NextResponse.json<ApiResponse<RegisterResponse>>(
        { success: true, data, message: 'Registration successful' },
        { status: 201 }
      );

      response.cookies.set('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60,
        path: '/',
      });

      logger.info('First user registered as CEO', {
        method: 'POST',
        path: '/api/auth/register',
        statusCode: 201,
        duration: Date.now() - start,
      });
      return response;
    }

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: 'PENDING',
        companyId: targetCompanyId,
      },
    });

    await prisma.joinRequest.create({
      data: {
        userId: user.id,
        companyId: targetCompanyId,
        status: 'PENDING',
      },
    });

    const token = await signToken({
      userId: user.id,
      email: user.email,
      companyId: user.companyId,
      role: 'PENDING',
    });

    const data: RegisterResponse = {
      user: { id: user.id, email: user.email, name: user.name, role: 'PENDING' },
      token,
      pending: true,
    };

    const response = NextResponse.json<ApiResponse<RegisterResponse>>(
      {
        success: true,
        data,
        message:
          'Your account is pending approval. Please wait for the company admin to approve your request.',
      },
      { status: 201 }
    );

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    logger.info('User registered as PENDING', {
      method: 'POST',
      path: '/api/auth/register',
      statusCode: 201,
      duration: Date.now() - start,
    });
    return response;
  } catch (error) {
    logger.error('Register error', { method: 'POST', path: '/api/auth/register', cause: error });
    return handleApiError(error);
  }
}
