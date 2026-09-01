import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { toNumber } from '@/lib/utils';
import { handleApiError } from '@/lib/errors';
import { logger } from '@/lib/logger';
import type { ApiResponse, Salary } from '@/types';

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

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const start = Date.now();
  try {
    const companyId = request.headers.get('x-company-id');
    if (!companyId) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;

    const salary = await prisma.salary.findFirst({
      where: { id, companyId },
      include: {
        user: { select: { id: true, name: true, avatar: true } },
      },
    });

    if (!salary) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Salary not found' },
        { status: 404 }
      );
    }

    logger.info('Salary fetched', {
      method: 'GET',
      path: `/api/salary/${id}`,
      statusCode: 200,
      duration: Date.now() - start,
    });
    return NextResponse.json<ApiResponse<{ salary: Salary }>>({
      success: true,
      data: { salary: serializeSalary(salary as unknown as Record<string, unknown>) },
    });
  } catch (error) {
    logger.error('Get salary error', {
      method: 'GET',
      path: `/api/salary/${await params.then((p) => p.id)}`,
      cause: error,
    });
    return handleApiError(error);
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const start = Date.now();
  try {
    const companyId = request.headers.get('x-company-id');
    if (!companyId) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { status, paidAt, amount, dueDate } = body;

    const existingSalary = await prisma.salary.findFirst({
      where: { id, companyId },
    });

    if (!existingSalary) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Salary not found' },
        { status: 404 }
      );
    }

    const salary = await prisma.salary.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(paidAt !== undefined && { paidAt: paidAt ? new Date(paidAt) : null }),
        ...(amount !== undefined && { amount }),
        ...(dueDate !== undefined && { dueDate: new Date(dueDate) }),
      },
      include: {
        user: { select: { id: true, name: true, avatar: true } },
      },
    });

    logger.info('Salary updated', {
      method: 'PUT',
      path: `/api/salary/${id}`,
      statusCode: 200,
      duration: Date.now() - start,
    });
    return NextResponse.json<ApiResponse<{ salary: Salary }>>({
      success: true,
      data: { salary: serializeSalary(salary as unknown as Record<string, unknown>) },
    });
  } catch (error) {
    logger.error('Update salary error', {
      method: 'PUT',
      path: `/api/salary/${await params.then((p) => p.id)}`,
      cause: error,
    });
    return handleApiError(error);
  }
}
