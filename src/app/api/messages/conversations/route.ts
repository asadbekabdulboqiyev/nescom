import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const companyId = request.headers.get('x-company-id');
    const userId = request.headers.get('x-user-id');
    if (!companyId || !userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all users in the company except current user
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

    // Get all messages for this user
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

    // Build conversation map from messages
    const conversationMap = new Map<
      string,
      {
        user: { id: string; name: string; avatar: string | null };
        lastMessage: string;
        lastMessageAt: Date;
        unread: number;
      }
    >();

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

    // Add users without conversations
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

    return NextResponse.json({ conversations });
  } catch (error) {
    console.error('Get conversations error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
