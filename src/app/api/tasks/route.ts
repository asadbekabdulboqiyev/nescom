import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createTaskSchema, validateRequest } from '@/lib/validation';
import { canManageTasks } from '@/lib/rbac';
import { Role } from '@/lib/roles';

export async function GET(request: Request) {
  try {
    const companyId = request.headers.get('x-company-id');
    if (!companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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

    return NextResponse.json(
      { tasks, pagination: { page, limit, total, pages: Math.ceil(total / limit) } },
      {
        headers: { 'Cache-Control': 'private, s-maxage=60, stale-while-revalidate=30' },
      }
    );
  } catch (error) {
    console.error('Get tasks error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const companyId = request.headers.get('x-company-id');
    const userId = request.headers.get('x-user-id');
    const userRole = request.headers.get('x-user-role') as Role | null;

    if (!companyId || !userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!userRole || !canManageTasks(userRole)) {
      return NextResponse.json(
        { error: 'You do not have permission to create tasks' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validation = validateRequest(createTaskSchema, body);

    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
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

    return NextResponse.json({ task }, { status: 201 });
  } catch (error) {
    console.error('Create task error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
