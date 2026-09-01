import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createTaskSchema, validateRequest } from '@/lib/validation';
import { canManageTasks } from '@/lib/rbac';
import { Role } from '@/lib/roles';
import { handleApiError } from '@/lib/errors';
import { logger } from '@/lib/logger';
import type { ApiResponse, PaginatedResponse, Task } from '@/types';

export async function GET(request: Request) {
  const start = Date.now();
  try {
    const companyId = request.headers.get('x-company-id');
    if (!companyId) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const assigneeId = searchParams.get('assigneeId');
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50', 10)));
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { companyId };
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (assigneeId) where.assigneeId = assigneeId;

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        include: {
          assignee: { select: { id: true, name: true, avatar: true } },
          creator: { select: { id: true, name: true, avatar: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.task.count({ where }),
    ]);

    const typedTasks: Task[] = tasks.map((t) => ({
      id: t.id,
      title: t.title,
      description: t.description ?? null,
      status: t.status,
      priority: t.priority,
      assigneeId: t.assigneeId ?? null,
      creatorId: t.creatorId,
      companyId: t.companyId,
      createdAt: t.createdAt.toISOString(),
      dueDate: t.dueDate?.toISOString() ?? null,
      tags: t.tags,
      assignee: t.assignee
        ? { id: t.assignee.id, name: t.assignee.name, avatar: t.assignee.avatar ?? null }
        : undefined,
      creator: t.creator
        ? { id: t.creator.id, name: t.creator.name, avatar: t.creator.avatar ?? null }
        : undefined,
    }));

    const response: PaginatedResponse<Task> = {
      success: true,
      data: typedTasks,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    };

    logger.info('Tasks listed', {
      method: 'GET',
      path: '/api/tasks',
      statusCode: 200,
      duration: Date.now() - start,
    });
    return NextResponse.json(response, {
      headers: { 'Cache-Control': 'private, s-maxage=60, stale-while-revalidate=30' },
    });
  } catch (error) {
    logger.error('Get tasks error', { method: 'GET', path: '/api/tasks', cause: error });
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
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
        { success: false, error: 'You do not have permission to create tasks' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validation = validateRequest(createTaskSchema, body);

    if (!validation.success) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: validation.error },
        { status: 400 }
      );
    }

    const { title, description, priority, dueDate, assigneeId } = validation.data;

    const task = await prisma.task.create({
      data: {
        title,
        description,
        status: 'TODO',
        priority: priority || 'MEDIUM',
        dueDate: dueDate ? new Date(dueDate) : null,
        assigneeId,
        creatorId: userId,
        companyId,
      },
      include: {
        assignee: { select: { id: true, name: true, avatar: true } },
        creator: { select: { id: true, name: true, avatar: true } },
      },
    });

    const typedTask: Task = {
      id: task.id,
      title: task.title,
      description: task.description ?? null,
      status: task.status,
      priority: task.priority,
      assigneeId: task.assigneeId ?? null,
      creatorId: task.creatorId,
      companyId: task.companyId,
      createdAt: task.createdAt.toISOString(),
      dueDate: task.dueDate?.toISOString() ?? null,
      tags: task.tags,
      assignee: task.assignee
        ? { id: task.assignee.id, name: task.assignee.name, avatar: task.assignee.avatar ?? null }
        : undefined,
      creator: task.creator
        ? { id: task.creator.id, name: task.creator.name, avatar: task.creator.avatar ?? null }
        : undefined,
    };

    logger.info('Task created', {
      method: 'POST',
      path: '/api/tasks',
      statusCode: 201,
      duration: Date.now() - start,
    });
    return NextResponse.json<ApiResponse<{ task: Task }>>(
      { success: true, data: { task: typedTask } },
      { status: 201 }
    );
  } catch (error) {
    logger.error('Create task error', { method: 'POST', path: '/api/tasks', cause: error });
    return handleApiError(error);
  }
}
