import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createUserSchema, validateRequest } from '@/lib/validation';
import { canManageUsers } from '@/lib/rbac';
import { Role } from '@/lib/roles';

export async function GET(request: Request) {
  try {
    const companyId = request.headers.get('x-company-id');
    if (!companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where: { companyId } }),
    ]);

    return NextResponse.json(
      { users, pagination: { page, limit, total, pages: Math.ceil(total / limit) } },
      {
        headers: { 'Cache-Control': 'private, s-maxage=60, stale-while-revalidate=30' },
      }
    );
  } catch (error) {
    console.error('Get users error:', error);
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

    if (!userRole || !canManageUsers(userRole)) {
      return NextResponse.json(
        { error: 'You do not have permission to create users' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validation = validateRequest(createUserSchema, body);

    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const { email, name, role, phone, salary, salaryDueDate, startDate, password: rawPassword } = validation.data;

    if (!email || !name || !role) {
      return NextResponse.json({ error: 'Email, name and role are required' }, { status: 400 });
    }

    if (!rawPassword || rawPassword.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
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
      },
    });

    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    console.error('Create user error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
