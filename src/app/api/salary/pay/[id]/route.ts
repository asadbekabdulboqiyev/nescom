import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { toNumber } from '@/lib/utils';
import { canManageSalary } from '@/lib/rbac';
import { Role } from '@/lib/roles';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const companyId = request.headers.get('x-company-id');
    const userRole = request.headers.get('x-user-role') as Role | null;

    if (!companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!userRole || !canManageSalary(userRole)) {
      return NextResponse.json({ error: 'Only CEO or Accountant can mark salary as paid' }, { status: 403 });
    }

    const { id } = await params;

    const existing = await prisma.salary.findFirst({
      where: { id, companyId },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Salary not found' }, { status: 404 });
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

    const serialized = {
      ...salary,
      amount: toNumber(salary.amount),
      bonus: toNumber(salary.bonus),
      deductions: toNumber(salary.deductions),
    };

    return NextResponse.json(serialized);
  } catch (error) {
    console.error('Pay salary error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
