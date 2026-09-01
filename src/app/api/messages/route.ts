import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createMessageSchema, validateRequest } from '@/lib/validation';
import { canSendMessage } from '@/lib/rbac';
import { Role } from '@/lib/roles';
import { handleApiError } from '@/lib/errors';
import { logger } from '@/lib/logger';
import type { ApiResponse, PaginatedResponse, Message } from '@/types';

function serializeMessage(m: Record<string, unknown>): Message {
  const createdAt = m.createdAt as Date;
  const sender = m.sender as { id: string; name: string; avatar: string | null };
  const receiver = m.receiver as { id: string; name: string; avatar: string | null };
  return {
    id: m.id as string,
    content: m.content as string,
    senderId: m.senderId as string,
    receiverId: m.receiverId as string,
    companyId: m.companyId as string,
    createdAt: createdAt.toISOString(),
    read: m.read as boolean,
    readAt: (m.readAt as Date | null)?.toISOString() ?? null,
    sender: { id: sender.id, name: sender.name, avatar: sender.avatar ?? null },
    receiver: { id: receiver.id, name: receiver.name, avatar: receiver.avatar ?? null },
  };
}

export async function GET(request: Request) {
  const start = Date.now();
  try {
    const companyId = request.headers.get('x-company-id');
    const userId = request.headers.get('x-user-id');
    if (!companyId || !userId) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const targetUserId = searchParams.get('userId');
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(200, Math.max(1, parseInt(searchParams.get('limit') || '50', 10)));
    const skip = (page - 1) * limit;

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

    const [messages, total] = await Promise.all([
      prisma.message.findMany({
        where,
        include: {
          sender: { select: { id: true, name: true, avatar: true } },
          receiver: { select: { id: true, name: true, avatar: true } },
        },
        orderBy: { createdAt: 'asc' },
        skip,
        take: limit,
      }),
      prisma.message.count({ where }),
    ]);

    const typedMessages = messages.map((m) =>
      serializeMessage(m as unknown as Record<string, unknown>)
    );

    const response: PaginatedResponse<Message> = {
      success: true,
      data: typedMessages,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    };

    logger.info('Messages listed', {
      method: 'GET',
      path: '/api/messages',
      statusCode: 200,
      duration: Date.now() - start,
    });
    return NextResponse.json(response, {
      headers: { 'Cache-Control': 'private, s-maxage=60, stale-while-revalidate=30' },
    });
  } catch (error) {
    logger.error('Get messages error', { method: 'GET', path: '/api/messages', cause: error });
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

    if (!userRole || !canSendMessage(userRole)) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'You do not have permission to send messages' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validation = validateRequest(createMessageSchema, body);

    if (!validation.success) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: validation.error },
        { status: 400 }
      );
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

    logger.info('Message created', {
      method: 'POST',
      path: '/api/messages',
      statusCode: 201,
      duration: Date.now() - start,
    });
    return NextResponse.json<ApiResponse<{ message: Message }>>(
      {
        success: true,
        data: { message: serializeMessage(message as unknown as Record<string, unknown>) },
      },
      { status: 201 }
    );
  } catch (error) {
    logger.error('Create message error', { method: 'POST', path: '/api/messages', cause: error });
    return handleApiError(error);
  }
}
