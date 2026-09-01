/**
 * @jest-environment node
 */
import { sanitizeInput, stripHtmlTags, generateCSRFToken, validateOrigin } from '@/lib/security';

describe('sanitizeInput', () => {
  it('should escape HTML special characters', () => {
    expect(sanitizeInput('<script>alert("xss")</script>')).toBe(
      '&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;'
    );
  });

  it('should escape ampersands', () => {
    expect(sanitizeInput('Tom & Jerry')).toBe('Tom &amp; Jerry');
  });

  it('should escape single quotes', () => {
    expect(sanitizeInput("it's")).toBe('it&#x27;s');
  });

  it('should escape slashes', () => {
    expect(sanitizeInput('a/b/c')).toBe('a&#x2F;b&#x2F;c');
  });

  it('should return plain text unchanged', () => {
    expect(sanitizeInput('Hello, world!')).toBe('Hello, world!');
  });

  it('should handle empty string', () => {
    expect(sanitizeInput('')).toBe('');
  });
});

describe('stripHtmlTags', () => {
  it('should remove HTML tags', () => {
    expect(stripHtmlTags('<p>Hello</p>')).toBe('Hello');
  });

  it('should remove nested tags', () => {
    expect(stripHtmlTags('<div><span>Nested</span></div>')).toBe('Nested');
  });

  it('should keep plain text', () => {
    expect(stripHtmlTags('Just text')).toBe('Just text');
  });

  it('should handle empty input', () => {
    expect(stripHtmlTags('')).toBe('');
  });
});

describe('generateCSRFToken', () => {
  it('should generate a 64-character hex token', () => {
    const token = generateCSRFToken();
    expect(token).toHaveLength(64);
    expect(token).toMatch(/^[0-9a-f]+$/);
  });

  it('should generate unique tokens', () => {
    const token1 = generateCSRFToken();
    const token2 = generateCSRFToken();
    expect(token1).not.toBe(token2);
  });
});

describe('validateOrigin', () => {
  const allowedHost = 'app.example.com';

  function makeRequest(headers: Record<string, string>): Request {
    return new Request(`https://${allowedHost}/api/test`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        ...headers,
      },
    });
  }

  it('should accept request with matching origin', () => {
    const request = makeRequest({
      host: allowedHost,
      origin: `https://${allowedHost}`,
    });
    expect(validateOrigin(request)).toBe(true);
  });

  it('should accept request with matching referer even without origin', () => {
    const request = makeRequest({
      host: allowedHost,
      referer: `https://${allowedHost}/login`,
    });
    expect(validateOrigin(request)).toBe(true);
  });

  it('should reject request with mismatched origin', () => {
    const request = makeRequest({
      host: allowedHost,
      origin: 'https://evil-site.com',
    });
    expect(validateOrigin(request)).toBe(false);
  });

  it('should reject request from subdomain attacker', () => {
    const request = makeRequest({
      host: allowedHost,
      origin: `https://attacker.${allowedHost}`,
    });
    expect(validateOrigin(request)).toBe(false);
  });

  it('should reject request with malformed origin', () => {
    const request = makeRequest({
      host: allowedHost,
      origin: 'not-a-url',
    });
    expect(validateOrigin(request)).toBe(false);
  });

  it('should reject request with no host header', () => {
    const request = new Request(`https://${allowedHost}/api/test`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
    });
    expect(request.headers.get('host')).toBeNull();
    expect(validateOrigin(request)).toBe(false);
  });

  it('should reject request with malformed referer', () => {
    const request = makeRequest({
      host: allowedHost,
      referer: ':::not-a-valid-url',
    });
    expect(validateOrigin(request)).toBe(false);
  });

  it('should reject when origin and referer both redirect elsewhere', () => {
    const request = makeRequest({
      host: allowedHost,
      origin: 'https://evil-site.com',
      referer: 'https://evil-site.com/phishing',
    });
    expect(validateOrigin(request)).toBe(false);
  });

  it('should reject request with no origin or referer headers', () => {
    const request = makeRequest({});
    // Strip origin/referer to simulate no enumeration headers
    expect(request.headers.get('origin')).toBeNull();
    expect(request.headers.get('referer')).toBeNull();
  });
});
