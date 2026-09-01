import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createUserSchema, validateRequest } from '@/lib/validation';
import { canManageUsers } from '@/lib/rbac';
import { Role } from '@/lib/roles';
import { handleApiError } from '@/lib/errors';
import { logger } from '@/lib/logger';
import type { ApiResponse, PaginatedResponse, User } from '@/types';

export async function GET(request: Request) {
  const start = Date.now();
  try {
    const companyId = request.headers.get('x-company-id');
    if (!companyId) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50', 10)));
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where: { companyId },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          avatar: true,
          phone: true,
          salary: true,
          salaryDueDate: true,
          startDate: true,
          createdAt: true,
          companyId: true,
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where: { companyId } }),
    ]);

    const typedUsers = users.map((u) => ({
      ...u,
      salary: u.salary ?? null,
      salaryDueDate: u.salaryDueDate?.toISOString() ?? null,
      startDate: u.startDate?.toISOString() ?? null,
      createdAt: u.createdAt.toISOString(),
    }));

    const response: PaginatedResponse<User> = {
      success: true,
      data: typedUsers,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    };

    logger.info('Users listed', {
      method: 'GET',
      path: '/api/users',
      statusCode: 200,
      duration: Date.now() - start,
    });
    return NextResponse.json(response, {
      headers: { 'Cache-Control': 'private, s-maxage=60, stale-while-revalidate=30' },
    });
  } catch (error) {
    logger.error('Get users error', { method: 'GET', path: '/api/users', cause: error });
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  const start = Date.now();
  try {
    const companyId = request.headers.get('x-company-id');
    const userRole = request.headers.get('x-user-role') as Role | null;

    if (!companyId) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!userRole || !canManageUsers(userRole)) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'You do not have permission to create users' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validation = validateRequest(createUserSchema, body);

    if (!validation.success) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: validation.error },
        { status: 400 }
      );
    }

    const {
      email,
      name,
      role,
      phone,
      salary,
      salaryDueDate,
      startDate,
      password: rawPassword,
    } = validation.data;

    if (!email || !name || !role) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Email, name and role are required' },
        { status: 400 }
      );
    }

    if (!rawPassword || rawPassword.length < 6) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    const bcrypt = await import('bcryptjs');
    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role,
        phone,
        salary,
        salaryDueDate: salaryDueDate ? new Date(salaryDueDate) : null,
        startDate: startDate ? new Date(startDate) : null,
        companyId,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        phone: true,
        salary: true,
        salaryDueDate: true,
        startDate: true,
        createdAt: true,
        companyId: true,
      },
    });

    const typedUser: User = {
      ...user,
      salary: user.salary ?? null,
      salaryDueDate: user.salaryDueDate?.toISOString() ?? null,
      startDate: user.startDate?.toISOString() ?? null,
      createdAt: user.createdAt.toISOString(),
    };

    logger.info('User created', {
      method: 'POST',
      path: '/api/users',
      statusCode: 201,
      duration: Date.now() - start,
    });
    return NextResponse.json<ApiResponse<{ user: User }>>(
      { success: true, data: { user: typedUser } },
      { status: 201 }
    );
  } catch (error) {
    logger.error('Create user error', { method: 'POST', path: '/api/users', cause: error });
    return handleApiError(error);
  }
}
