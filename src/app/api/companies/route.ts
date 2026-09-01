import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { canManageCompany } from '@/lib/rbac';
import { Role } from '@/lib/roles';
import { z } from 'zod';
import { handleApiError } from '@/lib/errors';
import { logger } from '@/lib/logger';
import type { ApiResponse, Company } from '@/types';

const createCompanySchema = z.object({
  name: z.string().min(1, 'Company name is required'),
  industry: z.string().optional(),
  description: z.string().optional(),
});

export async function GET() {
  const start = Date.now();
  try {
    const companies = await prisma.company.findMany({
      select: {
        id: true,
        name: true,
        code: true,
        industry: true,
        description: true,
        _count: { select: { users: true } },
      },
      orderBy: { createdAt: 'asc' },
    });

    const typedCompanies = companies.map((c) => ({
      id: c.id,
      name: c.name,
      code: c.code,
      industry: c.industry ?? null,
      description: c.description ?? null,
      userCount: c._count.users,
    }));

    logger.info('Companies listed', {
      method: 'GET',
      path: '/api/companies',
      statusCode: 200,
      duration: Date.now() - start,
    });
    return NextResponse.json<ApiResponse<{ companies: typeof typedCompanies }>>(
      { success: true, data: { companies: typedCompanies } },
      {
        headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30' },
      }
    );
  } catch (error) {
    logger.error('Get companies error', { method: 'GET', path: '/api/companies', cause: error });
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  const start = Date.now();
  try {
    const body = await request.json();
    const validation = createCompanySchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: validation.error.issues[0].message },
        { status: 400 }
      );
    }
    const { name, industry, description } = validation.data;

    const baseCode = name
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .slice(0, 4)
      .padEnd(4, 'X');

    let code = baseCode + Math.floor(100 + Math.random() * 900);

    let attempts = 0;
    while (attempts < 10) {
      const existing = await prisma.company.findUnique({ where: { code } });
      if (!existing) break;
      code = baseCode + Math.floor(100 + Math.random() * 900);
      attempts++;
    }

    const company = await prisma.company.create({
      data: {
        name: name.trim(),
        code,
        industry: industry || null,
        description: description || null,
      },
    });

    const typedCompany: Company = {
      id: company.id,
      name: company.name,
      code: company.code,
      industry: company.industry ?? null,
      description: company.description ?? null,
    };

    logger.info('Company created', {
      method: 'POST',
      path: '/api/companies',
      statusCode: 201,
      duration: Date.now() - start,
    });
    return NextResponse.json<ApiResponse<{ company: Company }>>(
      { success: true, data: { company: typedCompany } },
      { status: 201 }
    );
  } catch (error) {
    logger.error('Create company error', { method: 'POST', path: '/api/companies', cause: error });
    return handleApiError(error);
  }
}

export async function PUT(request: Request) {
  const start = Date.now();
  try {
    const userRole = request.headers.get('x-user-role') as Role | null;

    if (!userRole || !canManageCompany(userRole)) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'You do not have permission to update company' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { id, name, industry, description } = body;

    if (!id) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Company ID is required' },
        { status: 400 }
      );
    }

    const company = await prisma.company.update({
      where: { id },
      data: {
        ...(name && { name: name.trim() }),
        ...(industry !== undefined && { industry }),
        ...(description !== undefined && { description }),
      },
    });

    const typedCompany: Company = {
      id: company.id,
      name: company.name,
      code: company.code,
      industry: company.industry ?? null,
      description: company.description ?? null,
    };

    logger.info('Company updated', {
      method: 'PUT',
      path: '/api/companies',
      statusCode: 200,
      duration: Date.now() - start,
    });
    return NextResponse.json<ApiResponse<{ company: Company }>>({
      success: true,
      data: { company: typedCompany },
    });
  } catch (error) {
    logger.error('Update company error', { method: 'PUT', path: '/api/companies', cause: error });
    return handleApiError(error);
  }
}
