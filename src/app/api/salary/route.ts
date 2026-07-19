import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createSalarySchema, validateRequest } from '@/lib/validation';
import { canManageSalary, canViewSalary } from '@/lib/rbac';
import { Role } from '@/lib/roles';
import { toNumber } from '@/lib/utils';

function serializeSalary(salary: Record<string, unknown>) {
  return {
    ...salary,
    amount: toNumber(salary.amount),
    bonus: toNumber(salary.bonus),
    deductions: toNumber(salary.deductions),
  };
}

export async function GET(request: Request) {
  try {
    const companyId = request.headers.get('x-company-id');
    const userRole = request.headers.get('x-user-role') as Role | null;

    if (!companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!userRole || !canViewSalary(userRole)) {
      return NextResponse.json(
        { error: 'You do not have permission to view salary data' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');

    const where: Record<string, unknown> = { companyId };
    if (userId) where.userId = userId;
    if (status) where.status = status;

    const salaries = await prisma.salary.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, avatar: true } },
      },
      orderBy: { dueDate: 'desc' },
    });

    const serialized = salaries.map((s) => serializeSalary(s as Record<string, unknown>));

    return NextResponse.json(
      { salaries: serialized },
      {
        headers: { 'Cache-Control': 'private, s-maxage=60, stale-while-revalidate=30' },
      }
    );
  } catch (error) {
    console.error('Get salaries error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const companyId = request.headers.get('x-company-id');
    const userRole = request.headers.get('x-user-role') as Role | null;

    if (!companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!userRole || !canManageSalary(userRole)) {
      return NextResponse.json({ error: 'You do not have permission to create salary records' }, { status: 403 });
    }

    const body = await request.json();
    const validation = validateRequest(createSalarySchema, body);

    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
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

    return NextResponse.json({ salary: serializeSalary(salary as Record<string, unknown>) }, { status: 201 });
  } catch (error) {
    console.error('Create salary error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
