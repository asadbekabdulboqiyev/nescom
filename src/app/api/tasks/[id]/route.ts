import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { updateTaskSchema, validateRequest } from '@/lib/validation';
import { canManageTasks } from '@/lib/rbac';
import { Role } from '@/lib/roles';
import { handleApiError } from '@/lib/errors';
import { logger } from '@/lib/logger';
import type { ApiResponse, Task } from '@/types';

type TaskStatus = 'TODO' | 'ACCEPTED' | 'IN_PROGRESS' | 'READY' | 'DONE' | 'BLOCKED';

const VALID_TRANSITIONS: Record<TaskStatus, TaskStatus[]> = {
  TODO: ['ACCEPTED', 'BLOCKED'],
  ACCEPTED: ['IN_PROGRESS', 'BLOCKED'],
  IN_PROGRESS: ['READY', 'BLOCKED'],
  READY: ['DONE', 'BLOCKED'],
  DONE: [],
  BLOCKED: ['TODO'],
};

function canTransition(
  currentStatus: TaskStatus,
  newStatus: TaskStatus,
  role: Role,
  userId: string,
  assigneeId: string | null
): boolean {
  if (newStatus === 'BLOCKED') {
    return role === 'CEO' || role === 'MANAGER';
  }

  if (currentStatus === 'BLOCKED' && newStatus === 'TODO') {
    return role === 'CEO' || role === 'MANAGER';
  }

  if (currentStatus === 'TODO' && newStatus === 'ACCEPTED') {
    return true;
  }

  if (currentStatus === 'ACCEPTED' && newStatus === 'IN_PROGRESS') {
    return assigneeId === userId || role === 'CEO' || role === 'MANAGER';
  }

  if (currentStatus === 'IN_PROGRESS' && newStatus === 'READY') {
    return assigneeId === userId || role === 'CEO' || role === 'MANAGER';
  }

  if (currentStatus === 'READY' && newStatus === 'DONE') {
    return role === 'CEO' || role === 'MANAGER';
  }

  return false;
}

function serializeTask(t: Record<string, unknown>): Task {
  const dueDate = t.dueDate as Date | null | undefined;
  const createdAt = t.createdAt as Date;
  const assignee = t.assignee as
    { id: string; name: string; avatar: string | null } | null | undefined;
  const creator = t.creator as
    { id: string; name: string; avatar: string | null } | null | undefined;
  return {
    id: t.id as string,
    title: t.title as string,
    description: (t.description as string | null) ?? null,
    status: t.status as string,
    priority: t.priority as string,
    assigneeId: (t.assigneeId as string | null) ?? null,
    creatorId: t.creatorId as string,
    companyId: t.companyId as string,
    createdAt: createdAt.toISOString(),
    dueDate: dueDate?.toISOString() ?? null,
    tags: (t.tags as string[]) ?? [],
    assignee: assignee
      ? { id: assignee.id, name: assignee.name, avatar: assignee.avatar ?? null }
      : undefined,
    creator: creator
      ? { id: creator.id, name: creator.name, avatar: creator.avatar ?? null }
      : undefined,
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

    const task = await prisma.task.findFirst({
      where: { id, companyId },
      include: {
        assignee: { select: { id: true, name: true, avatar: true } },
        creator: { select: { id: true, name: true, avatar: true } },
      },
    });

    if (!task) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Task not found' },
        { status: 404 }
      );
    }

    logger.info('Task fetched', {
      method: 'GET',
      path: `/api/tasks/${id}`,
      statusCode: 200,
      duration: Date.now() - start,
    });
    return NextResponse.json<ApiResponse<{ task: Task }>>({
      success: true,
      data: { task: serializeTask(task as unknown as Record<string, unknown>) },
    });
  } catch (error) {
    logger.error('Get task error', {
      method: 'GET',
      path: `/api/tasks/${await params.then((p) => p.id)}`,
      cause: error,
    });
    return handleApiError(error);
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const start = Date.now();
  try {
    const companyId = request.headers.get('x-company-id');
    const userId = request.headers.get('x-user-id');
    const userRole = request.headers.get('x-user-role') as Role | null;

    if (!companyId || !userId) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!userRole || !canManageTasks(userRole)) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'You do not have permission to update tasks' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const validation = validateRequest(updateTaskSchema, body);

    if (!validation.success) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: validation.error },
        { status: 400 }
      );
    }

    const existingTask = await prisma.task.findFirst({
      where: { id, companyId },
    });

    if (!existingTask) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Task not found' },
        { status: 404 }
      );
    }

    const { title, description, status, priority, dueDate, assigneeId } = validation.data;

    if (status && status !== existingTask.status) {
      const allowed = VALID_TRANSITIONS[existingTask.status as TaskStatus] || [];
      if (!allowed.includes(status as TaskStatus)) {
        return NextResponse.json<ApiResponse>(
          {
            success: false,
            error: `Transition from ${existingTask.status} to ${status} is not allowed. Allowed: ${allowed.join(', ') || 'none'}`,
          },
          { status: 400 }
        );
      }

      if (
        !canTransition(
          existingTask.status as TaskStatus,
          status as TaskStatus,
          userRole,
          userId,
          existingTask.assigneeId
        )
      ) {
        return NextResponse.json<ApiResponse>(
          { success: false, error: 'You do not have permission for this transition' },
          { status: 403 }
        );
      }
    }

    const task = await prisma.task.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(status && { status }),
        ...(priority && { priority }),
        ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
        ...(assigneeId !== undefined && {
          assignee: assigneeId ? { connect: { id: assigneeId } } : { disconnect: true },
        }),
      },
      include: {
        assignee: { select: { id: true, name: true, avatar: true } },
        creator: { select: { id: true, name: true, avatar: true } },
      },
    });

    logger.info('Task updated', {
      method: 'PUT',
      path: `/api/tasks/${id}`,
      statusCode: 200,
      duration: Date.now() - start,
    });
    return NextResponse.json<ApiResponse<{ task: Task }>>({
      success: true,
      data: { task: serializeTask(task as unknown as Record<string, unknown>) },
    });
  } catch (error) {
    logger.error('Update task error', {
      method: 'PUT',
      path: `/api/tasks/${await params.then((p) => p.id)}`,
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

    if (!userRole || !canManageTasks(userRole)) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'You do not have permission to delete tasks' },
        { status: 403 }
      );
    }

    const { id } = await params;

    const existingTask = await prisma.task.findFirst({
      where: { id, companyId },
    });

    if (!existingTask) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Task not found' },
        { status: 404 }
      );
    }

    await prisma.task.delete({ where: { id } });

    logger.info('Task deleted', {
      method: 'DELETE',
      path: `/api/tasks/${id}`,
      statusCode: 200,
      duration: Date.now() - start,
    });
    return NextResponse.json<ApiResponse>(
      { success: true, message: 'Task deleted' },
      { status: 200 }
    );
  } catch (error) {
    logger.error('Delete task error', {
      method: 'DELETE',
      path: `/api/tasks/${await params.then((p) => p.id)}`,
      cause: error,
    });
    return handleApiError(error);
  }
}
