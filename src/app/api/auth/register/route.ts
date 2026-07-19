import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { signToken } from '@/lib/auth';
import { registerSchema, validateRequest } from '@/lib/validation';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = validateRequest(registerSchema, body);

    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const { email, password, name, companyId } = validation.data;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
    }

    let targetCompanyId = companyId;

    if (!targetCompanyId) {
      const firstCompany = await prisma.company.findFirst({
        orderBy: { createdAt: 'asc' },
      });
      if (!firstCompany) {
        return NextResponse.json(
          { error: 'Company not found. Please create a company first.' },
          { status: 400 }
        );
      }
      targetCompanyId = firstCompany.id;
    }

    const company = await prisma.company.findUnique({
      where: { id: targetCompanyId },
    });
    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    const userCount = await prisma.user.count({
      where: { companyId: targetCompanyId },
    });

    const isFirstUser = userCount === 0;
    const hashedPassword = await bcrypt.hash(password, 10);

    if (isFirstUser) {
      // First user → CEO, auto-approved
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          role: 'CEO',
          companyId: targetCompanyId,
        },
      });

      const token = signToken({
        userId: user.id,
        email: user.email,
        companyId: user.companyId,
        role: user.role,
      });

      const response = NextResponse.json(
        { user: { id: user.id, email: user.email, name: user.name, role: user.role }, token },
        { status: 201 }
      );

      response.cookies.set('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60,
        path: '/',
      });

      return response;
    }

    // Other users → PENDING status, need CEO/Manager approval
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: 'PENDING',
        companyId: targetCompanyId,
      },
    });

    await prisma.joinRequest.create({
      data: {
        userId: user.id,
        companyId: targetCompanyId,
        status: 'PENDING',
      },
    });

    // Return limited token — user can see pending status but can't access dashboard
    const token = signToken({
      userId: user.id,
      email: user.email,
      companyId: user.companyId,
      role: 'PENDING',
    });

    const response = NextResponse.json(
      {
        user: { id: user.id, email: user.email, name: user.name, role: 'PENDING' },
        token,
        message: 'Your account is pending approval. Please wait for the company admin to approve your request.',
        pending: true,
      },
      { status: 201 }
    );

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
