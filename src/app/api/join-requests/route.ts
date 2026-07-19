import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import {
  createJoinRequestSchema,
  validateRequest,
} from '@/lib/validation';
import { canReviewJoinRequests } from '@/lib/rbac';

export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { id: currentUser.userId } });
    if (!user || !canReviewJoinRequests(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const joinRequests = await prisma.joinRequest.findMany({
      where: { companyId: currentUser.companyId },
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ joinRequests });
  } catch (error) {
    console.error('Get join requests error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validation = validateRequest(createJoinRequestSchema, body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const { companyId, message } = validation.data;

    const company = await prisma.company.findUnique({ where: { id: companyId } });
    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    const existingRequest = await prisma.joinRequest.findFirst({
      where: {
        userId: currentUser.userId,
        companyId,
        status: 'PENDING',
      },
    });

    if (existingRequest) {
      return NextResponse.json(
        { error: 'You already have a pending request for this company' },
        { status: 409 }
      );
    }

    const joinRequest = await prisma.joinRequest.create({
      data: {
        userId: currentUser.userId,
        companyId,
        message: message || undefined,
      },
    });

    return NextResponse.json({ joinRequest }, { status: 201 });
  } catch (error) {
    console.error('Create join request error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
