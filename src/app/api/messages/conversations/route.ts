import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { handleApiError } from '@/lib/errors';
import { logger } from '@/lib/logger';
import type { ApiResponse } from '@/types';

interface Conversation {
  user: { id: string; name: string; avatar: string | null };
  lastMessage: string;
  lastMessageAt: Date;
  unread: number;
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

    const allUsers = await prisma.user.findMany({
      where: {
        companyId,
        id: { not: userId },
      },
      select: {
        id: true,
        name: true,
        avatar: true,
      },
    });

    const messages = await prisma.message.findMany({
      where: {
        companyId,
        OR: [{ senderId: userId }, { receiverId: userId }],
      },
      include: {
        sender: { select: { id: true, name: true, avatar: true } },
        receiver: { select: { id: true, name: true, avatar: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const conversationMap = new Map<string, Conversation>();

    for (const msg of messages) {
      const otherUser: { id: string; name: string; avatar: string | null } =
        msg.senderId === userId ? msg.receiver : msg.sender;
      if (!otherUser || otherUser.id === userId) continue;

      const existing = conversationMap.get(otherUser.id);
      if (!existing) {
        conversationMap.set(otherUser.id, {
          user: otherUser,
          lastMessage: msg.content,
          lastMessageAt: msg.createdAt,
          unread: msg.receiverId === userId && msg.senderId !== userId && !msg.read ? 1 : 0,
        });
      } else if (msg.receiverId === userId && msg.senderId !== userId && !msg.read) {
        existing.unread += 1;
      }
    }

    for (const user of allUsers) {
      if (!conversationMap.has(user.id)) {
        conversationMap.set(user.id, {
          user,
          lastMessage: '',
          lastMessageAt: new Date(0),
          unread: 0,
        });
      }
    }

    const conversations = Array.from(conversationMap.values()).sort(
      (a, b) => b.lastMessageAt.getTime() - a.lastMessageAt.getTime()
    );

    logger.info('Conversations listed', {
      method: 'GET',
      path: '/api/messages/conversations',
      statusCode: 200,
      duration: Date.now() - start,
    });
    return NextResponse.json<ApiResponse<{ conversations: Conversation[] }>>({
      success: true,
      data: { conversations },
    });
  } catch (error) {
    logger.error('Get conversations error', {
      method: 'GET',
      path: '/api/messages/conversations',
      cause: error,
    });
    return handleApiError(error);
  }
}
