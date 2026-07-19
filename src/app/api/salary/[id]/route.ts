import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { toNumber } from '@/lib/utils';

function serializeSalary(salary: Record<string, unknown>) {
  return {
    ...salary,
    amount: toNumber(salary.amount),
    bonus: toNumber(salary.bonus),
    deductions: toNumber(salary.deductions),
  };
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const companyId = request.headers.get('x-company-id');
    if (!companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const salary = await prisma.salary.findFirst({
      where: { id, companyId },
      include: {
        user: { select: { id: true, name: true, avatar: true } },
      },
    });

    if (!salary) {
      return NextResponse.json({ error: 'Salary not found' }, { status: 404 });
    }

    return NextResponse.json(serializeSalary(salary as Record<string, unknown>));
  } catch (error) {
    console.error('Get salary error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const companyId = request.headers.get('x-company-id');
    if (!companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { status, paidAt, amount, dueDate } = body;

    const existingSalary = await prisma.salary.findFirst({
      where: { id, companyId },
    });

    if (!existingSalary) {
      return NextResponse.json({ error: 'Salary not found' }, { status: 404 });
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

    return NextResponse.json(serializeSalary(salary as Record<string, unknown>));
  } catch (error) {
    console.error('Update salary error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
