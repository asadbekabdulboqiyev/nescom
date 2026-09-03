import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { updateUserSchema, validateRequest } from '@/lib/validation';
import { canManageUsers, canAssignRole } from '@/lib/rbac';
import { Role } from '@/lib/roles';
import { handleApiError } from '@/lib/errors';
import { logger } from '@/lib/logger';
import type { ApiResponse, User } from '@/types';

function serializeUser(u: Record<string, unknown>): User {
  const obj = u as Record<string, unknown>;
  const salaryDueDate = obj.salaryDueDate as Date | null | undefined;
  const startDate = obj.startDate as Date | null | undefined;
  const createdAt = obj.createdAt as Date;
  return {
    id: obj.id as string,
    email: obj.email as string,
    name: obj.name as string,
    role: obj.role as string,
    avatar: (obj.avatar as string | null) ?? null,
    phone: (obj.phone as string | null) ?? null,
    salary: (obj.salary as number | null) ?? null,
    salaryDueDate: salaryDueDate?.toISOString() ?? null,
    startDate: startDate?.toISOString() ?? null,
    companyId: obj.companyId as string,
    createdAt: createdAt.toISOString(),
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
        companyId: true,
        company: { select: { id: true, name: true } },
      },
    });

    if (!user) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    logger.info('User fetched', {
      method: 'GET',
      path: `/api/users/${id}`,
      statusCode: 200,
      duration: Date.now() - start,
    });
    return NextResponse.json<ApiResponse<{ user: User }>>({
      success: true,
      data: { user: serializeUser(user as unknown as Record<string, unknown>) },
    });
  } catch (error) {
    logger.error('Get user error', {
      method: 'GET',
      path: `/api/users/${await params.then((p) => p.id)}`,
      cause: error,
    });
    return handleApiError(error);
  }
}

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

    if (!userRole || !canManageUsers(userRole)) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'You do not have permission to update users' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const validation = validateRequest(updateUserSchema, body);

    if (!validation.success) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: validation.error },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findFirst({
      where: { id, companyId },
    });

    if (!existingUser) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    const { name, email, role, phone, salary, salaryDueDate, startDate, avatar } = validation.data;

    // P0 privilege escalation guard: a MANAGER/HR editing a user must not be
    // able to promote them to CEO or another MANAGER. Only the CEO may.
    if (role && role !== existingUser.role && !canAssignRole(userRole, role)) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'You do not have permission to assign this role' },
        { status: 403 }
      );
    }

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
        companyId: true,
      },
    });

    logger.info('User updated', {
      method: 'PUT',
      path: `/api/users/${id}`,
      statusCode: 200,
      duration: Date.now() - start,
    });
    return NextResponse.json<ApiResponse<{ user: User }>>({
      success: true,
      data: { user: serializeUser(user as unknown as Record<string, unknown>) },
    });
  } catch (error) {
    logger.error('Update user error', {
      method: 'PUT',
      path: `/api/users/${await params.then((p) => p.id)}`,
      cause: error,
    });
    return handleApiError(error);
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
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
        { success: false, error: 'You do not have permission to delete users' },
        { status: 403 }
      );
    }

    const { id } = await params;

    const existingUser = await prisma.user.findFirst({
      where: { id, companyId },
    });

    if (!existingUser) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    await prisma.$transaction([
      prisma.notification.deleteMany({ where: { userId: id } }),
      prisma.message.deleteMany({ where: { senderId: id } }),
      prisma.message.deleteMany({ where: { receiverId: id } }),
      prisma.file.deleteMany({ where: { senderId: id } }),
      prisma.file.deleteMany({ where: { receiverId: id } }),
      prisma.salary.deleteMany({ where: { userId: id } }),
      prisma.task.deleteMany({ where: { assigneeId: id } }),
      prisma.task.deleteMany({ where: { creatorId: id } }),
      prisma.joinRequest.deleteMany({ where: { userId: id } }),
      prisma.joinRequest.deleteMany({ where: { reviewedBy: id } }),
      prisma.user.delete({ where: { id } }),
    ]);

    logger.info('User deleted', {
      method: 'DELETE',
      path: `/api/users/${id}`,
      statusCode: 200,
      duration: Date.now() - start,
    });
    return NextResponse.json<ApiResponse>(
      { success: true, message: 'User deleted' },
      { status: 200 }
    );
  } catch (error) {
    logger.error('Delete user error', {
      method: 'DELETE',
      path: `/api/users/${await params.then((p) => p.id)}`,
      cause: error,
    });
    return handleApiError(error);
  }
}
