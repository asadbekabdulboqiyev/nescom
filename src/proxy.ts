import { NextResponse, type NextRequest } from 'next/server';
import { jwtVerify } from 'jose';
import { isCsrfSafe as isCsrfSafeImpl } from '@/lib/csrf';

function getJwtSecret(): Uint8Array {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is required');
  }
  return new TextEncoder().encode(process.env.JWT_SECRET);
}

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000;
const RATE_LIMIT_MAX = 100;

const loginFailMap = new Map<string, { count: number; resetTime: number }>();
const LOGIN_FAIL_WINDOW = 15 * 60 * 1000;
const LOGIN_FAIL_MAX = 5;

const apiRateLimitMap = new Map<string, { count: number; resetTime: number }>();
const API_RATE_LIMIT_WINDOW = 60 * 1000;
const API_RATE_LIMIT_MAX = 200;

function cleanupMap(map: Map<string, { count: number; resetTime: number }>, maxAge: number) {
  const now = Date.now();
  for (const [key, entry] of map) {
    if (now > entry.resetTime + maxAge) {
      map.delete(key);
    }
  }
}

function isLoginRateLimited(key: string): boolean {
  const now = Date.now();
  const entry = loginFailMap.get(key);

  if (!entry || now > entry.resetTime) {
    loginFailMap.set(key, { count: 1, resetTime: now + LOGIN_FAIL_WINDOW });
    return false;
  }

  entry.count++;
  return entry.count > LOGIN_FAIL_MAX;
}

export function recordLoginFailure(key: string): void {
  const now = Date.now();
  const entry = loginFailMap.get(key);

  if (!entry || now > entry.resetTime) {
    loginFailMap.set(key, { count: 1, resetTime: now + LOGIN_FAIL_WINDOW });
    return;
  }

  entry.count++;
}

export function resetLoginFailures(key: string): void {
  loginFailMap.delete(key);
}

function getRateLimitKey(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded?.split(',')[0] || 'unknown';
  return ip;
}

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(key);

  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return false;
  }

  entry.count++;
  return entry.count > RATE_LIMIT_MAX;
}

function isApiRateLimited(key: string): boolean {
  const now = Date.now();
  const entry = apiRateLimitMap.get(key);

  if (!entry || now > entry.resetTime) {
    apiRateLimitMap.set(key, { count: 1, resetTime: now + API_RATE_LIMIT_WINDOW });
    return false;
  }

  entry.count++;
  return entry.count > API_RATE_LIMIT_MAX;
}

export function isCsrfSafe(request: NextRequest): boolean {
  return isCsrfSafeImpl({
    method: request.method,
    headers: request.headers,
  });
}

function isPublicApi(pathname: string, method: string): boolean {
  if (
    pathname === '/api/auth/login' ||
    pathname === '/api/auth/register' ||
    pathname === '/api/auth/logout'
  ) {
    return true;
  }
  if (pathname === '/api/companies' && (method === 'GET' || method === 'POST')) return true;
  if (pathname === '/api/health') return true;
  return false;
}

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const method = request.method;

  cleanupMap(rateLimitMap, RATE_LIMIT_WINDOW * 2);
  cleanupMap(apiRateLimitMap, API_RATE_LIMIT_WINDOW * 2);

  const rateLimitKey = getRateLimitKey(request);
  if (isRateLimited(rateLimitKey)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  if (pathname.startsWith('/api/') && !pathname.startsWith('/api/auth/')) {
    const apiLimitKey = `${rateLimitKey}:${pathname}`;
    if (isApiRateLimited(apiLimitKey)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }
  }

  if (pathname === '/api/auth/login' && method === 'POST') {
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded?.split(',')[0] || 'unknown';
    let email = '';
    try {
      const cloned = request.clone();
      const body = await cloned.json();
      email = body.email || '';
    } catch {}
    const loginKey = `${ip}:${email}`;
    if (isLoginRateLimited(loginKey)) {
      return NextResponse.json(
        { error: 'Too many login attempts. Please try again in 15 minutes.' },
        { status: 429 }
      );
    }
  }

  if (pathname.startsWith('/api/')) {
    if (!isPublicApi(pathname, method)) {
      if (!isCsrfSafe(request)) {
        return NextResponse.json({ error: 'CSRF validation failed' }, { status: 403 });
      }
    }

    if (isPublicApi(pathname, method)) {
      return NextResponse.next();
    }

    const cookieToken = request.cookies.get('token')?.value;
    const authHeader = request.headers.get('authorization');
    const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
    const authToken = cookieToken || bearerToken;

    if (!authToken) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    try {
      const { payload } = await jwtVerify(authToken, getJwtSecret());

      // Block PENDING users from accessing dashboard
      if (payload.role === 'PENDING') {
        return NextResponse.json(
          {
            error:
              'Your account is pending approval. Please wait for the company admin to approve your request.',
          },
          { status: 403 }
        );
      }

      // P0 SAFETY: strip any client-supplied trust headers so a caller
      // cannot spoof x-user-id / x-company-id / x-user-role. Identity is
      // derived solely from the verified JWT below.
      const trustedHeaders = new Headers(request.headers);
      for (const h of ['x-user-id', 'x-user-email', 'x-company-id', 'x-user-role']) {
        trustedHeaders.delete(h);
      }

      trustedHeaders.set('x-user-id', payload.userId as string);
      trustedHeaders.set('x-user-email', payload.email as string);
      trustedHeaders.set('x-company-id', payload.companyId as string);
      trustedHeaders.set('x-user-role', payload.role as string);

      // Next.js 16: request headers must be passed via the `request` option
      // (NOT response.headers.set, which only affects the client response).
      const response = NextResponse.next({ request: { headers: trustedHeaders } });
      return response;
    } catch {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
  }

  if (
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/employees') ||
    pathname.startsWith('/tasks') ||
    pathname.startsWith('/settings') ||
    pathname.startsWith('/salary') ||
    pathname.startsWith('/messages')
  ) {
    const cookieToken = request.cookies.get('token')?.value;

    if (!cookieToken) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    try {
      await jwtVerify(cookieToken, getJwtSecret());
      return NextResponse.next();
    } catch {
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/api/:path*',
    '/dashboard/:path*',
    '/employees/:path*',
    '/tasks/:path*',
    '/settings/:path*',
    '/salary/:path*',
    '/messages/:path*',
  ],
};
