import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { createJoinRequestSchema, validateRequest } from '@/lib/validation';
import { canReviewJoinRequests } from '@/lib/rbac';
import { handleApiError } from '@/lib/errors';
import { logger } from '@/lib/logger';
import type { ApiResponse, JoinRequest } from '@/types';

export async function GET() {
  const start = Date.now();
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({ where: { id: currentUser.userId } });
    if (!user || !canReviewJoinRequests(user.role)) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }

    const joinRequests = await prisma.joinRequest.findMany({
      where: { companyId: currentUser.companyId },
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    });

    const typedRequests: JoinRequest[] = joinRequests.map((jr) => ({
      id: jr.id,
      userId: jr.userId,
      companyId: jr.companyId,
      status: jr.status,
      message: jr.message ?? null,
      reviewedBy: jr.reviewedBy ?? null,
      reviewedAt: jr.reviewedAt?.toISOString() ?? null,
      createdAt: jr.createdAt.toISOString(),
      user: jr.user ? { id: jr.user.id, name: jr.user.name, email: jr.user.email } : undefined,
    }));

    logger.info('Join requests listed', {
      method: 'GET',
      path: '/api/join-requests',
      statusCode: 200,
      duration: Date.now() - start,
    });
    return NextResponse.json<ApiResponse<{ joinRequests: JoinRequest[] }>>({
      success: true,
      data: { joinRequests: typedRequests },
    });
  } catch (error) {
    logger.error('Get join requests error', {
      method: 'GET',
      path: '/api/join-requests',
      cause: error,
    });
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  const start = Date.now();
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validation = validateRequest(createJoinRequestSchema, body);
    if (!validation.success) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: validation.error },
        { status: 400 }
      );
    }

    const { companyId, message } = validation.data;

    const company = await prisma.company.findUnique({ where: { id: companyId } });
    if (!company) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Company not found' },
        { status: 404 }
      );
    }

    const existingRequest = await prisma.joinRequest.findFirst({
      where: {
        userId: currentUser.userId,
        companyId,
        status: 'PENDING',
      },
    });

    if (existingRequest) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'You already have a pending request for this company' },
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

    const typedRequest: JoinRequest = {
      id: joinRequest.id,
      userId: joinRequest.userId,
      companyId: joinRequest.companyId,
      status: joinRequest.status,
      message: joinRequest.message ?? null,
      reviewedBy: joinRequest.reviewedBy ?? null,
      reviewedAt: joinRequest.reviewedAt?.toISOString() ?? null,
      createdAt: joinRequest.createdAt.toISOString(),
    };

    logger.info('Join request created', {
      method: 'POST',
      path: '/api/join-requests',
      statusCode: 201,
      duration: Date.now() - start,
    });
    return NextResponse.json<ApiResponse<{ joinRequest: JoinRequest }>>(
      { success: true, data: { joinRequest: typedRequest } },
      { status: 201 }
    );
  } catch (error) {
    logger.error('Create join request error', {
      method: 'POST',
      path: '/api/join-requests',
      cause: error,
    });
    return handleApiError(error);
  }
}
