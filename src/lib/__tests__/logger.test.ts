/**
 * @jest-environment node
 */
import { logger } from '@/lib/logger';

describe('logger', () => {
  const originalLog = console.log;
  const originalWarn = console.warn;
  const originalError = console.error;

  afterEach(() => {
    console.log = originalLog;
    console.warn = originalWarn;
    console.error = originalError;
    jest.clearAllMocks();
  });

  it('should log info messages with level tag', () => {
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    logger.info('Server started');
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('[INFO] Server started'));
  });

  it('should include method and path in info log', () => {
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    logger.info('Request handled', { method: 'GET', path: '/api/tasks', statusCode: 200 });
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('GET /api/tasks 200'));
  });

  it('should include duration in log', () => {
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    logger.info('Request handled', { method: 'POST', path: '/api/tasks', duration: 42 });
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('42ms'));
  });

  it('should log warn messages', () => {
    const spy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    logger.warn('Deprecated endpoint', { path: '/old' });
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('[WARN]'));
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('/old'));
  });

  it('should log error messages', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    logger.error('Task creation failed', { statusCode: 500 });
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('[ERROR]'));
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('Task creation failed'));
  });

  it('should log error cause stack when provided', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const cause = new Error('database down');
    logger.error('Failed', { cause });
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('database down'));
  });

  it('should not log stack when cause is not an Error', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    logger.error('Failed', { cause: 'string-cause' });
    // Only one error call (no stack line)
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('should include timestamp in log entries', () => {
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    logger.info('Hello');
    const arg = spy.mock.calls[0][0] as string;
    expect(arg).toMatch(/\[\d{4}-\d{2}-\d{2}T/);
  });
});
