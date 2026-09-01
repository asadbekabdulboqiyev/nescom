import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { toNumber } from '@/lib/utils';
import { canManageSalary } from '@/lib/rbac';
import { Role } from '@/lib/roles';
import { handleApiError } from '@/lib/errors';
import { logger } from '@/lib/logger';
import type { ApiResponse, Salary } from '@/types';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
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
        { success: false, error: 'Only CEO or Accountant can mark salary as paid' },
        { status: 403 }
      );
    }

    const { id } = await params;

    const existing = await prisma.salary.findFirst({
      where: { id, companyId },
    });

    if (!existing) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Salary not found' },
        { status: 404 }
      );
    }

    const salary = await prisma.salary.update({
      where: { id },
      data: {
        status: 'PAID',
        paidAt: new Date(),
      },
      include: {
        user: { select: { id: true, name: true, avatar: true } },
      },
    });

    const serialized: Salary = {
      id: salary.id,
      userId: salary.userId,
      amount: toNumber(salary.amount),
      bonus: toNumber(salary.bonus),
      deductions: toNumber(salary.deductions),
      status: salary.status,
      dueDate: salary.dueDate.toISOString(),
      paidAt: salary.paidAt?.toISOString() ?? null,
      companyId: salary.companyId,
      user: salary.user
        ? { id: salary.user.id, name: salary.user.name, avatar: salary.user.avatar ?? null }
        : undefined,
    };

    logger.info('Salary marked as paid', {
      method: 'PUT',
      path: `/api/salary/pay/${id}`,
      statusCode: 200,
      duration: Date.now() - start,
    });
    return NextResponse.json<ApiResponse<{ salary: Salary }>>({
      success: true,
      data: { salary: serialized },
    });
  } catch (error) {
    logger.error('Pay salary error', {
      method: 'PUT',
      path: `/api/salary/pay/${await params.then((p) => p.id)}`,
      cause: error,
    });
    return handleApiError(error);
  }
}
