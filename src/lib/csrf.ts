/**
 * CSRF protection helper.
 *
 * Cross-site request forgery guard used by the global proxy.
 *
 * Defense-in-depth:
 *  - Safe methods (GET/HEAD/OPTIONS) are always allowed.
 *  - State-changing requests must carry an Origin (or Referer) matching the
 *    Host. Cross-site requests never match, so they are rejected.
 *  - JSON is NOT implicitly trusted (a JSON POST with no Origin is exactly
 *    the primitive used by cross-site JSON CSRF).
 *  - Server-side clients (curl/node) are allowed to send state-changing
 *    requests without Origin, since they are not subject to browser CSRF.
 */

export type CsrfRequest = {
  method: string;
  headers: Headers;
};

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

export function isCsrfSafe(request: CsrfRequest): boolean {
  const method = request.method.toUpperCase();
  if (SAFE_METHODS.has(method)) {
    return true;
  }

  const host = request.headers.get('host');
  if (!host) return false;

  const origin = request.headers.get('origin');
  if (origin) {
    // Same-origin request from a browser is CSRF-safe. Cross-origin is not.
    try {
      return new URL(origin).host === host;
    } catch {
      return false;
    }
  }

  // No Origin header. Cross-site form POSTs send Origin in modern browsers.
  // Fall back to Referer as a secondary signal.
  const referer = request.headers.get('referer');
  if (referer) {
    try {
      return new URL(referer).host === host;
    } catch {
      return false;
    }
  }

  // If neither Origin nor Referer is present, only trust unambiguous
  // server-side clients. A browser request without Origin for a
  // state-changing verb is treated as suspicious (defensive default).
  const userAgent = request.headers.get('user-agent') || '';
  return userAgent.includes('node') || userAgent.includes('curl');
}
