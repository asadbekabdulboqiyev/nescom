import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createSalarySchema, validateRequest } from '@/lib/validation';
import { canManageSalary, canViewSalary } from '@/lib/rbac';
import { Role } from '@/lib/roles';
import { toNumber } from '@/lib/utils';
import { handleApiError } from '@/lib/errors';
import { logger } from '@/lib/logger';
import type { ApiResponse, PaginatedResponse, Salary } from '@/types';

function serializeSalary(s: Record<string, unknown>): Salary {
  const dueDate = s.dueDate as Date;
  const paidAt = s.paidAt as Date | null | undefined;
  const user = s.user as { id: string; name: string; avatar: string | null } | undefined;
  return {
    id: s.id as string,
    userId: s.userId as string,
    amount: toNumber(s.amount),
    bonus: toNumber(s.bonus),
    deductions: toNumber(s.deductions),
    status: s.status as string,
    dueDate: dueDate.toISOString(),
    paidAt: paidAt?.toISOString() ?? null,
    companyId: s.companyId as string,
    user: user ? { id: user.id, name: user.name, avatar: user.avatar ?? null } : undefined,
  };
}

export async function GET(request: Request) {
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

    if (!userRole || !canViewSalary(userRole)) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'You do not have permission to view salary data' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50', 10)));
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { companyId };
    if (userId) where.userId = userId;
    if (status) where.status = status;

    const [salaries, total] = await Promise.all([
      prisma.salary.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, avatar: true } },
        },
        orderBy: { dueDate: 'desc' },
        skip,
        take: limit,
      }),
      prisma.salary.count({ where }),
    ]);

    const serialized = salaries.map((s) =>
      serializeSalary(s as unknown as Record<string, unknown>)
    );

    const response: PaginatedResponse<Salary> = {
      success: true,
      data: serialized,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    };

    logger.info('Salaries listed', {
      method: 'GET',
      path: '/api/salary',
      statusCode: 200,
      duration: Date.now() - start,
    });
    return NextResponse.json(response, {
      headers: { 'Cache-Control': 'private, s-maxage=60, stale-while-revalidate=30' },
    });
  } catch (error) {
    logger.error('Get salaries error', { method: 'GET', path: '/api/salary', cause: error });
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

    if (!userRole || !canManageSalary(userRole)) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'You do not have permission to create salary records' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validation = validateRequest(createSalarySchema, body);

    if (!validation.success) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: validation.error },
        { status: 400 }
      );
    }

    const { userId, amount, dueDate, bonus, deductions } = validation.data;

    const salary = await prisma.salary.create({
      data: {
        userId,
        amount,
        dueDate: new Date(dueDate),
        bonus: bonus ?? 0,
        deductions: deductions ?? 0,
        companyId,
      },
      include: {
        user: { select: { id: true, name: true, avatar: true } },
      },
    });

    logger.info('Salary created', {
      method: 'POST',
      path: '/api/salary',
      statusCode: 201,
      duration: Date.now() - start,
    });
    return NextResponse.json<ApiResponse<{ salary: Salary }>>(
      {
        success: true,
        data: { salary: serializeSalary(salary as unknown as Record<string, unknown>) },
      },
      { status: 201 }
    );
  } catch (error) {
    logger.error('Create salary error', { method: 'POST', path: '/api/salary', cause: error });
    return handleApiError(error);
  }
}
