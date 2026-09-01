type LogLevel = 'info' | 'warn' | 'error';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  method?: string;
  path?: string;
  statusCode?: number;
  message: string;
  duration?: number;
}

function formatEntry(entry: LogEntry): string {
  const parts = [`[${entry.timestamp}]`, `[${entry.level.toUpperCase()}]`];
  if (entry.method) parts.push(entry.method);
  if (entry.path) parts.push(entry.path);
  if (entry.statusCode) parts.push(`${entry.statusCode}`);
  if (entry.duration != null) parts.push(`${entry.duration}ms`);
  parts.push(entry.message);
  return parts.join(' ');
}

function timestamp(): string {
  return new Date().toISOString();
}

export const logger = {
  info(
    message: string,
    meta?: { method?: string; path?: string; statusCode?: number; duration?: number }
  ) {
    const entry: LogEntry = { timestamp: timestamp(), level: 'info', message, ...meta };
    console.log(formatEntry(entry));
  },

  warn(
    message: string,
    meta?: { method?: string; path?: string; statusCode?: number; duration?: number }
  ) {
    const entry: LogEntry = { timestamp: timestamp(), level: 'warn', message, ...meta };
    console.warn(formatEntry(entry));
  },

  error(
    message: string,
    meta?: {
      method?: string;
      path?: string;
      statusCode?: number;
      duration?: number;
      cause?: unknown;
    }
  ) {
    const entry: LogEntry = { timestamp: timestamp(), level: 'error', message, ...meta };
    console.error(formatEntry(entry));
    if (meta?.cause instanceof Error && meta.cause.stack) {
      console.error(meta.cause.stack);
    }
  },
};
