import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { reviewJoinRequestSchema, validateRequest } from '@/lib/validation';
import { canReviewJoinRequests } from '@/lib/rbac';
import { Role } from '@/lib/roles';
import { handleApiError } from '@/lib/errors';
import { logger } from '@/lib/logger';
import type { ApiResponse, JoinRequest } from '@/types';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const start = Date.now();
  try {
    const userId = request.headers.get('x-user-id');
    const companyId = request.headers.get('x-company-id');
    const userRole = request.headers.get('x-user-role') as Role | null;

    if (!userId || !companyId || !userRole) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!canReviewJoinRequests(userRole)) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const validation = validateRequest(reviewJoinRequestSchema, body);
    if (!validation.success) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: validation.error },
        { status: 400 }
      );
    }

    const { status, role } = validation.data;

    const joinRequest = await prisma.joinRequest.findUnique({ where: { id } });
    if (!joinRequest) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Join request not found' },
        { status: 404 }
      );
    }

    if (joinRequest.companyId !== companyId) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }

    if (joinRequest.status !== 'PENDING') {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Request already reviewed' },
        { status: 400 }
      );
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

    const typedRequest: JoinRequest = {
      id: updatedRequest.id,
      userId: updatedRequest.userId,
      companyId: updatedRequest.companyId,
      status: updatedRequest.status,
      message: updatedRequest.message ?? null,
      reviewedBy: updatedRequest.reviewedBy ?? null,
      reviewedAt: updatedRequest.reviewedAt?.toISOString() ?? null,
      createdAt: updatedRequest.createdAt.toISOString(),
    };

    logger.info('Join request reviewed', {
      method: 'PUT',
      path: `/api/join-requests/${id}`,
      statusCode: 200,
      duration: Date.now() - start,
    });
    return NextResponse.json<ApiResponse<{ joinRequest: JoinRequest }>>({
      success: true,
      data: { joinRequest: typedRequest },
    });
  } catch (error) {
    logger.error('Review join request error', {
      method: 'PUT',
      path: `/api/join-requests/${await params.then((p) => p.id)}`,
      cause: error,
    });
    return handleApiError(error);
  }
}
