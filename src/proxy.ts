import { NextResponse, type NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

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

function isCsrfSafe(request: NextRequest): boolean {
  const method = request.method;
  if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS') {
    return true;
  }

  const origin = request.headers.get('origin');
  const host = request.headers.get('host');

  if (origin && host) {
    try {
      const originUrl = new URL(origin);
      if (originUrl.host !== host) {
        const referer = request.headers.get('referer');
        if (referer) {
          try {
            const refererUrl = new URL(referer);
            if (refererUrl.host === host) {
              return true;
            }
          } catch {}
        }
        return false;
      }
    } catch {
      return false;
    }
  }

  const contentType = request.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return true;
  }

  return false;
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

export async function proxy(request: NextRequest) {
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
      return NextResponse.json({ error: 'Rate limit exceeded. Please try again later.' }, { status: 429 });
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
      const { payload } = await jwtVerify(authToken, JWT_SECRET);

      // Block PENDING users from accessing dashboard
      if (payload.role === 'PENDING') {
        return NextResponse.json({ error: 'Your account is pending approval. Please wait for the company admin to approve your request.' }, { status: 403 });
      }

      const response = NextResponse.next();
      response.headers.set('x-user-id', payload.userId as string);
      response.headers.set('x-user-email', payload.email as string);
      response.headers.set('x-company-id', payload.companyId as string);
      response.headers.set('x-user-role', payload.role as string);
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
      await jwtVerify(cookieToken, JWT_SECRET);
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
