import { SignJWT, jwtVerify, type JWTPayload } from 'jose';
import { cookies } from 'next/headers';

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is required');
  }
  return new TextEncoder().encode(secret);
}

export interface JwtPayload extends JWTPayload {
  userId: string;
  email: string;
  companyId: string;
  role: string;
}

export async function signToken(payload: JwtPayload): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(getJwtSecret());
}

export async function verifyToken(token: string): Promise<JwtPayload> {
  const { payload } = await jwtVerify(token, getJwtSecret());
  return payload as JwtPayload;
}

export async function getTokenFromHeaders(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('token');
  if (token) return token.value;

  return null;
}

export async function getCurrentUser(): Promise<JwtPayload | null> {
  const token = await getTokenFromHeaders();
  if (!token) return null;

  try {
    return await verifyToken(token);
  } catch {
    return null;
  }
}
