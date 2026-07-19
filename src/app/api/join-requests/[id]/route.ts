import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  reviewJoinRequestSchema,
  validateRequest,
} from '@/lib/validation';
import { canReviewJoinRequests } from '@/lib/rbac';
import { Role } from '@/lib/roles';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = request.headers.get('x-user-id');
    const companyId = request.headers.get('x-company-id');
    const userRole = request.headers.get('x-user-role') as Role | null;

    if (!userId || !companyId || !userRole) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!canReviewJoinRequests(userRole)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const validation = validateRequest(reviewJoinRequestSchema, body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const { status, role } = validation.data;

    const joinRequest = await prisma.joinRequest.findUnique({ where: { id } });
    if (!joinRequest) {
      return NextResponse.json({ error: 'Join request not found' }, { status: 404 });
    }

    if (joinRequest.companyId !== companyId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (joinRequest.status !== 'PENDING') {
      return NextResponse.json({ error: 'Request already reviewed' }, { status: 400 });
    }

    const updatedRequest = await prisma.joinRequest.update({
      where: { id },
      data: {
        status,
        reviewedBy: userId,
        reviewedAt: new Date(),
      },
    });

    if (status === 'APPROVED') {
      await prisma.user.update({
        where: { id: joinRequest.userId },
        data: {
          role: role || 'DEVELOPER',
        },
      });
    } else if (status === 'REJECTED') {
      await prisma.user.delete({
        where: { id: joinRequest.userId },
      });
    }

    return NextResponse.json({ joinRequest: updatedRequest });
  } catch (error) {
    console.error('Review join request error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
