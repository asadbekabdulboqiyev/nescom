import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createMessageSchema, validateRequest } from '@/lib/validation';
import { canSendMessage } from '@/lib/rbac';
import { Role } from '@/lib/roles';

export async function GET(request: Request) {
  try {
    const companyId = request.headers.get('x-company-id');
    const userId = request.headers.get('x-user-id');
    if (!companyId || !userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const targetUserId = searchParams.get('userId');

    const where: Record<string, unknown> = {
      companyId,
      OR: [{ senderId: userId }, { receiverId: userId }],
    };

    if (targetUserId) {
      where.OR = [
        { senderId: userId, receiverId: targetUserId },
        { senderId: targetUserId, receiverId: userId },
      ];
    }

    const messages = await prisma.message.findMany({
      where,
      include: {
        sender: { select: { id: true, name: true, avatar: true } },
        receiver: { select: { id: true, name: true, avatar: true } },
      },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json(
      { messages },
      {
        headers: { 'Cache-Control': 'private, s-maxage=60, stale-while-revalidate=30' },
      }
    );
  } catch (error) {
    console.error('Get messages error:', error);
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

    if (!userRole || !canSendMessage(userRole)) {
      return NextResponse.json({ error: 'You do not have permission to send messages' }, { status: 403 });
    }

    const body = await request.json();
    const validation = validateRequest(createMessageSchema, body);

    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const { content, receiverId } = validation.data;

    const message = await prisma.message.create({
      data: {
        content,
        senderId: userId,
        receiverId,
        companyId,
      },
      include: {
        sender: { select: { id: true, name: true, avatar: true } },
        receiver: { select: { id: true, name: true, avatar: true } },
      },
    });

    return NextResponse.json({ message }, { status: 201 });
  } catch (error) {
    console.error('Create message error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
