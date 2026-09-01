import { randomBytes } from 'crypto';

export function sanitizeInput(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

export function stripHtmlTags(input: string): string {
  return input.replace(/<[^>]*>/g, '');
}

export function generateCSRFToken(): string {
  return randomBytes(32).toString('hex');
}

export function validateOrigin(request: Request): boolean {
  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');
  const host = request.headers.get('host');

  if (!host) return false;

  if (origin) {
    try {
      const originUrl = new URL(origin);
      if (originUrl.host === host) return true;
    } catch {
      return false;
    }
  }

  if (referer) {
    try {
      const refererUrl = new URL(referer);
      if (refererUrl.host === host) return true;
    } catch {
      return false;
    }
  }

  const contentType = request.headers.get('content-type') || '';
  if (contentType.includes('multipart/form-data')) return true;

  return false;
}
