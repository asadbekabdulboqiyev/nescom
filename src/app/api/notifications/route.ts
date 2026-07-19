import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const createNotificationSchema = z.object({
  userId: z.string().min(1),
  title: z.string().min(1),
  message: z.string().min(1),
  type: z.enum(['TASK', 'MESSAGE', 'SALARY']),
});

export async function GET(request: Request) {
  try {
    const companyId = request.headers.get('x-company-id');
    const userId = request.headers.get('x-user-id');
    if (!companyId || !userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const unreadOnly = searchParams.get('unreadOnly') === 'true';

    const notifications = await prisma.notification.findMany({
      where: {
        userId,
        companyId,
        ...(unreadOnly && { read: false }),
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const unreadCount = await prisma.notification.count({
      where: { userId, companyId, read: false },
    });

    return NextResponse.json(
      { notifications, unreadCount },
      {
        headers: { 'Cache-Control': 'private, s-maxage=60, stale-while-revalidate=30' },
      }
    );
  } catch (error) {
    console.error('Get notifications error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const companyId = request.headers.get('x-company-id');
    const userId = request.headers.get('x-user-id');
    const userRole = request.headers.get('x-user-role');
    if (!companyId || !userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validation = createNotificationSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }
    const { userId: targetUserId, title, message, type } = validation.data;

    if (userRole !== 'CEO' && userRole !== 'MANAGER' && targetUserId !== userId) {
      return NextResponse.json(
        { error: 'You can only create notifications for yourself' },
        { status: 403 }
      );
    }

    const notification = await prisma.notification.create({
      data: { userId: targetUserId, companyId, title, message, type },
    });

    return NextResponse.json({ notification }, { status: 201 });
  } catch (error) {
    console.error('Create notification error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const companyId = request.headers.get('x-company-id');
    const userId = request.headers.get('x-user-id');
    if (!companyId || !userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action, id } = body;

    if (action === 'readAll') {
      await prisma.notification.updateMany({
        where: { userId, companyId, read: false },
        data: { read: true },
      });
      return NextResponse.json({ success: true });
    }

    if (action === 'read' && id) {
      await prisma.notification.updateMany({
        where: { id, userId, companyId },
        data: { read: true },
      });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Update notifications error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
