import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is required');
  }
  return secret;
}

const JWT_SECRET = getJwtSecret();

export interface JwtPayload {
  userId: string;
  email: string;
  companyId: string;
  role: string;
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
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
    return verifyToken(token);
  } catch {
    return null;
  }
}
