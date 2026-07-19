import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { updateTaskSchema, validateRequest } from '@/lib/validation';
import { canManageTasks } from '@/lib/rbac';
import { Role } from '@/lib/roles';

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

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const companyId = request.headers.get('x-company-id');
    if (!companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    return NextResponse.json(task);
  } catch (error) {
    console.error('Get task error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const companyId = request.headers.get('x-company-id');
    const userId = request.headers.get('x-user-id');
    const userRole = request.headers.get('x-user-role') as Role | null;

    if (!companyId || !userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!userRole || !canManageTasks(userRole)) {
      return NextResponse.json(
        { error: 'You do not have permission to update tasks' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const validation = validateRequest(updateTaskSchema, body);

    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const existingTask = await prisma.task.findFirst({
      where: { id, companyId },
    });

    if (!existingTask) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    const { title, description, status, priority, dueDate, assigneeId } = validation.data;

    if (status && status !== existingTask.status) {
      const allowed = VALID_TRANSITIONS[existingTask.status as TaskStatus] || [];
      if (!allowed.includes(status as TaskStatus)) {
        return NextResponse.json(
          {
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
        return NextResponse.json(
          { error: 'You do not have permission for this transition' },
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

    return NextResponse.json(task);
  } catch (error) {
    console.error('Update task error:', error);
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

    if (!userRole || !canManageTasks(userRole)) {
      return NextResponse.json(
        { error: 'You do not have permission to delete tasks' },
        { status: 403 }
      );
    }

    const { id } = await params;

    const existingTask = await prisma.task.findFirst({
      where: { id, companyId },
    });

    if (!existingTask) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    await prisma.task.delete({ where: { id } });

    return NextResponse.json({ message: 'Task deleted' });
  } catch (error) {
    console.error('Delete task error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
