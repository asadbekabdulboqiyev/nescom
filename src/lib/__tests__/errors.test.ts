/**
 * @jest-environment node
 */
import {
  AppError,
  NotFoundError,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  ConflictError,
  handleApiError,
} from '@/lib/errors';

describe('AppError', () => {
  it('should create an error with status code and message', () => {
    const error = new AppError('Something failed', 500);
    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe('Something failed');
    expect(error.statusCode).toBe(500);
    expect(error.isOperational).toBe(true);
  });

  it('should default isOperational to true', () => {
    const error = new AppError('test', 400);
    expect(error.isOperational).toBe(true);
  });

  it('should respect non-operational flag', () => {
    const error = new AppError('test', 500, false);
    expect(error.isOperational).toBe(false);
  });

  it('should set prototype correctly for instanceof checks', () => {
    const error = new AppError('test', 500);
    expect(error instanceof AppError).toBe(true);
    expect(error instanceof Error).toBe(true);
  });
});

describe('Error subclasses', () => {
  it('NotFoundError should have 404 status', () => {
    const error = new NotFoundError();
    expect(error.statusCode).toBe(404);
    expect(error.message).toBe('Resource not found');
  });

  it('NotFoundError should accept custom message', () => {
    const error = new NotFoundError('Task not found');
    expect(error.message).toBe('Task not found');
  });

  it('ValidationError should have 400 status and issues', () => {
    const error = new ValidationError('Validation failed', ['email is required']);
    expect(error.statusCode).toBe(400);
    expect(error.issues).toEqual(['email is required']);
  });

  it('ValidationError should default issues to empty array', () => {
    const error = new ValidationError();
    expect(error.issues).toEqual([]);
  });

  it('UnauthorizedError should have 401 status', () => {
    const error = new UnauthorizedError();
    expect(error.statusCode).toBe(401);
    expect(error.message).toBe('Unauthorized');
  });

  it('ForbiddenError should have 403 status', () => {
    const error = new ForbiddenError('Access denied');
    expect(error.statusCode).toBe(403);
    expect(error.message).toBe('Access denied');
  });

  it('ConflictError should have 409 status', () => {
    const error = new ConflictError();
    expect(error.statusCode).toBe(409);
    expect(error.message).toBe('Resource already exists');
  });

  it('all subclasses should be instances of AppError', () => {
    expect(new NotFoundError()).toBeInstanceOf(AppError);
    expect(new ValidationError()).toBeInstanceOf(AppError);
    expect(new UnauthorizedError()).toBeInstanceOf(AppError);
    expect(new ForbiddenError()).toBeInstanceOf(AppError);
    expect(new ConflictError()).toBeInstanceOf(AppError);
  });
});

describe('handleApiError', () => {
  it('should return AppError with its status code', () => {
    const error = new NotFoundError('Task not found');
    const response = handleApiError(error);
    expect(response.status).toBe(404);
  });

  it('should return 500 with internal server error message for unknown errors', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const response = handleApiError(new Error('boom'));
    expect(response.status).toBe(500);
    consoleSpy.mockRestore();
  });

  it('should include error message in response for AppError', () => {
    const error = new ForbiddenError('No permission');
    const response = handleApiError(error);
    return response.json().then((body) => {
      expect(body).toEqual({ success: false, error: 'No permission' });
    });
  });
});
