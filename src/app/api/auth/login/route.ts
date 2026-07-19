import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { signToken } from '@/lib/auth';
import { loginSchema, validateRequest } from '@/lib/validation';
import { recordLoginFailure, resetLoginFailures } from '@/proxy';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = validateRequest(loginSchema, body);

    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const { email, password } = validation.data;

    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded?.split(',')[0] || 'unknown';
    const loginKey = `${ip}:${email}`;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      recordLoginFailure(loginKey);
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      recordLoginFailure(loginKey);
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    resetLoginFailures(loginKey);

    // Block PENDING users from logging in
    if (user.role === 'PENDING') {
      return NextResponse.json(
        { error: 'Your account is pending approval. Please wait for the company admin to approve your request.', pending: true },
        { status: 403 }
      );
    }

    const token = signToken({
      userId: user.id,
      email: user.email,
      companyId: user.companyId,
      role: user.role,
    });

    const response = NextResponse.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        companyId: user.companyId,
      },
    });

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
