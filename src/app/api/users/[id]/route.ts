import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { updateUserSchema, validateRequest } from '@/lib/validation';
import { canManageUsers } from '@/lib/rbac';
import { Role } from '@/lib/roles';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const companyId = request.headers.get('x-company-id');
    if (!companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const user = await prisma.user.findFirst({
      where: { id, companyId },
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
        company: { select: { id: true, name: true } },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const companyId = request.headers.get('x-company-id');
    const userRole = request.headers.get('x-user-role') as Role | null;

    if (!companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!userRole || !canManageUsers(userRole)) {
      return NextResponse.json(
        { error: 'You do not have permission to update users' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const validation = validateRequest(updateUserSchema, body);

    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const existingUser = await prisma.user.findFirst({
      where: { id, companyId },
    });

    if (!existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { name, email, role, phone, salary, salaryDueDate, startDate, avatar } = validation.data;

    const user = await prisma.user.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(email && { email }),
        ...(role && { role }),
        ...(phone !== undefined && { phone }),
        ...(salary !== undefined && { salary }),
        ...(salaryDueDate !== undefined && {
          salaryDueDate: salaryDueDate ? new Date(salaryDueDate) : null,
        }),
        ...(startDate !== undefined && { startDate: startDate ? new Date(startDate) : null }),
        ...(avatar !== undefined && { avatar }),
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
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const companyId = request.headers.get('x-company-id');
    const userRole = request.headers.get('x-user-role') as Role | null;

    if (!companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!userRole || !canManageUsers(userRole)) {
      return NextResponse.json(
        { error: 'You do not have permission to delete users' },
        { status: 403 }
      );
    }

    const { id } = await params;

    const existingUser = await prisma.user.findFirst({
      where: { id, companyId },
    });

    if (!existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    await prisma.user.delete({ where: { id } });

    return NextResponse.json({ message: 'User deleted' });
  } catch (error) {
    console.error('Delete user error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
