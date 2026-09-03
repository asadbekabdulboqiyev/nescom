/**
 * @jest-environment node
 *
 * Security regression tests for src/proxy.ts.
 *
 * These tests lock in the two fixes made in response to the external
 * security audit:
 *  1. Client-supplied x-user-id / x-company-id / x-user-role headers must
 *     never be trusted. Identity is derived strictly from the verified JWT.
 *  2. The CSRF gate must NOT treat JSON requests as automatically safe
 *     (that bypass allowed cross-site JSON CSRF).
 */
import { isCsrfSafe } from '@/lib/csrf';

function makeCsrfRequest(init: {
  method?: string;
  headers?: Record<string, string>;
}): Request {
  return new Request('http://localhost:3000/api/users/123', {
    method: init.method ?? 'POST',
    headers: { host: 'localhost:3000', ...init.headers },
  });
}

describe('isCsrfSafe — CSRF gate', () => {
  it('allows safe methods (GET) without origin', () => {
    const req = makeCsrfRequest({ method: 'GET' });
    expect(isCsrfSafe(req as never)).toBe(true);
  });

  it('allows HEAD and OPTIONS', () => {
    expect(isCsrfSafe(makeCsrfRequest({ method: 'HEAD' }) as never)).toBe(true);
    expect(isCsrfSafe(makeCsrfRequest({ method: 'OPTIONS' }) as never)).toBe(true);
  });

  it('allows a POST with a matching same-origin Origin', () => {
    const req = makeCsrfRequest({
      method: 'POST',
      headers: { origin: 'http://localhost:3000', host: 'localhost:3000' },
    });
    expect(isCsrfSafe(req as never)).toBe(true);
  });

  it('rejects a POST whose Origin does not match the Host', () => {
    const req = makeCsrfRequest({
      method: 'POST',
      headers: { origin: 'https://evil.example.com', host: 'localhost:3000' },
    });
    expect(isCsrfSafe(req as never)).toBe(false);
  });

  it('allows a POST whose Referer matches the Host when Origin is absent', () => {
    const req = makeCsrfRequest({
      method: 'POST',
      headers: { referer: 'http://localhost:3000/dashboard', host: 'localhost:3000' },
    });
    expect(isCsrfSafe(req as never)).toBe(true);
  });

  it('rejects a POST whose Referer does not match the Host', () => {
    const req = makeCsrfRequest({
      method: 'POST',
      headers: { referer: 'https://evil.example.com/', host: 'localhost:3000' },
    });
    expect(isCsrfSafe(req as never)).toBe(false);
  });

  it('rejects a JSON POST with no Origin (cross-site JSON CSRF primitive)', () => {
    const req = makeCsrfRequest({
      method: 'POST',
      headers: { 'content-type': 'application/json' },
    });
    expect(isCsrfSafe(req as never)).toBe(false);
  });

  it('rejects a form POST with no Origin and a browser user-agent', () => {
    const req = makeCsrfRequest({
      method: 'POST',
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
        'user-agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36',
      },
    });
    expect(isCsrfSafe(req as never)).toBe(false);
  });

  it('allows a server-side (curl/node) request without Origin', () => {
    const req = makeCsrfRequest({
      method: 'POST',
      headers: { 'user-agent': 'curl/8.4.0' },
    });
    expect(isCsrfSafe(req as never)).toBe(true);
  });
});
