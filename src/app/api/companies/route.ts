import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { canManageCompany } from '@/lib/rbac';
import { Role } from '@/lib/roles';
import { z } from 'zod';

const createCompanySchema = z.object({
  name: z.string().min(1, 'Company name is required'),
  industry: z.string().optional(),
  description: z.string().optional(),
});

export async function GET() {
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

    return NextResponse.json(
      { companies },
      {
        headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30' },
      }
    );
  } catch (error) {
    console.error('Get companies error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = createCompanySchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }
    const { name, industry, description } = validation.data;

    // Generate unique 6-char code from company name
    const baseCode = name
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .slice(0, 4)
      .padEnd(4, 'X');
    
    let code = baseCode + Math.floor(100 + Math.random() * 900);
    
    // Ensure unique code
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

    return NextResponse.json({ company }, { status: 201 });
  } catch (error) {
    console.error('Create company error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const userRole = request.headers.get('x-user-role') as Role | null;

    if (!userRole || !canManageCompany(userRole)) {
      return NextResponse.json(
        { error: 'You do not have permission to update company' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { id, name, industry, description } = body;

    if (!id) {
      return NextResponse.json({ error: 'Company ID is required' }, { status: 400 });
    }

    const company = await prisma.company.update({
      where: { id },
      data: {
        ...(name && { name: name.trim() }),
        ...(industry !== undefined && { industry }),
        ...(description !== undefined && { description }),
      },
    });

    return NextResponse.json({ company });
  } catch (error) {
    console.error('Update company error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
