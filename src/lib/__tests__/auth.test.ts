/**
 * @jest-environment node
 */
import { signToken, verifyToken, getCurrentUser, type JwtPayload } from '@/lib/auth';
import { cookies } from 'next/headers';

// Mock next/headers cookies
jest.mock('next/headers', () => ({
  cookies: jest.fn(),
}));

// Mock jose (ESM-only package, can't be compiled by Jest)
jest.mock('jose', () => ({
  SignJWT: jest.fn().mockImplementation((_payload) => ({
    setProtectedHeader: jest.fn().mockReturnThis(),
    setIssuedAt: jest.fn().mockReturnThis(),
    setExpirationTime: jest.fn().mockReturnThis(),
    sign: jest.fn().mockResolvedValue('mock.signed.jwt'),
  })),
  jwtVerify: jest.fn(),
  type: {},
}));

const mockedCookies = cookies as jest.MockedFunction<typeof cookies>;
const mockedJwtVerify = jest.requireMock('jose').jwtVerify as jest.Mock;

const TEST_SECRET = 'test-secret-key-that-is-at-least-32-chars-long!!';

const testPayload: JwtPayload = {
  userId: 'user_123',
  email: 'test@example.com',
  companyId: 'company_456',
  role: 'MANAGER',
  sub: 'user_123',
};

describe('signToken', () => {
  beforeEach(() => {
    process.env.JWT_SECRET = TEST_SECRET;
  });

  afterEach(() => {
    delete process.env.JWT_SECRET;
    jest.clearAllMocks();
  });

  it('should create a valid JWT token', async () => {
    const token = await signToken(testPayload);
    expect(typeof token).toBe('string');
    expect(token).toBe('mock.signed.jwt');
  });

  it('should throw when JWT_SECRET is missing', async () => {
    delete process.env.JWT_SECRET;
    await expect(signToken(testPayload)).rejects.toThrow(
      'JWT_SECRET environment variable is required'
    );
  });

  it('should sign with HS256 payload', async () => {
    await signToken(testPayload);
    const mockSignJWT = jest.requireMock('jose').SignJWT;
    expect(mockSignJWT).toHaveBeenCalledWith(testPayload);
  });
});

describe('verifyToken', () => {
  beforeEach(() => {
    process.env.JWT_SECRET = TEST_SECRET;
  });

  afterEach(() => {
    delete process.env.JWT_SECRET;
    jest.clearAllMocks();
  });

  it('should verify a valid token and return payload', async () => {
    mockedJwtVerify.mockResolvedValueOnce({ payload: testPayload });
    const result = await verifyToken('some.token');
    expect(result.userId).toBe('user_123');
    expect(result.role).toBe('MANAGER');
  });

  it('should propagate verification errors', async () => {
    mockedJwtVerify.mockRejectedValueOnce(new Error('Invalid signature'));
    await expect(verifyToken('bad.token')).rejects.toThrow('Invalid signature');
  });

  it('should throw when JWT_SECRET is missing', async () => {
    delete process.env.JWT_SECRET;
    await expect(verifyToken('abc.def.ghi')).rejects.toThrow(
      'JWT_SECRET environment variable is required'
    );
  });
});

describe('getCurrentUser', () => {
  beforeEach(() => {
    process.env.JWT_SECRET = TEST_SECRET;
  });

  afterEach(() => {
    delete process.env.JWT_SECRET;
    jest.clearAllMocks();
  });

  it('should return null when no token cookie exists', async () => {
    mockedCookies.mockResolvedValue({
      get: jest.fn().mockReturnValue(undefined),
    } as never);

    const user = await getCurrentUser();
    expect(user).toBeNull();
  });

  it('should return payload when valid token cookie exists', async () => {
    mockedJwtVerify.mockResolvedValueOnce({ payload: testPayload });
    mockedCookies.mockResolvedValue({
      get: jest.fn().mockReturnValue({ value: 'valid.token' }),
    } as never);

    const user = await getCurrentUser();
    expect(user).not.toBeNull();
    expect(user?.userId).toBe('user_123');
  });

  it('should return null when token verification fails', async () => {
    mockedJwtVerify.mockRejectedValueOnce(new Error('expired'));
    mockedCookies.mockResolvedValue({
      get: jest.fn().mockReturnValue({ value: 'expired.token' }),
    } as never);

    const user = await getCurrentUser();
    expect(user).toBeNull();
  });
});
