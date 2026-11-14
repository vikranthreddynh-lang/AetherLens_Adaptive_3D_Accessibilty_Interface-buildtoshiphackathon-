import { env } from '../config/env.js';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LEVEL_WEIGHTS: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

function shouldLog(level: LogLevel): boolean {
  return LEVEL_WEIGHTS[level] >= LEVEL_WEIGHTS[env.LOG_LEVEL as LogLevel];
}

function sanitizeMeta(meta: Record<string, unknown>): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(meta)) {
    // Redact any raw audio, base64 data, passwords, tickets, tokens, or biometric info
    if (
      key.toLowerCase().includes('token') ||
      key.toLowerCase().includes('ticket') ||
      key.toLowerCase().includes('secret') ||
      key.toLowerCase().includes('key') ||
      key.toLowerCase().includes('base64') ||
      key.toLowerCase().includes('audio') ||
      key.toLowerCase().includes('video')
    ) {
      sanitized[key] = '[REDACTED]';
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

export const logger = {
  debug(message: string, meta: Record<string, unknown> = {}) {
    if (shouldLog('debug')) {
      console.debug(JSON.stringify({ timestamp: new Date().toISOString(), level: 'DEBUG', message, ...sanitizeMeta(meta) }));
    }
  },
  info(message: string, meta: Record<string, unknown> = {}) {
    if (shouldLog('info')) {
      console.log(JSON.stringify({ timestamp: new Date().toISOString(), level: 'INFO', message, ...sanitizeMeta(meta) }));
    }
  },
  warn(message: string, meta: Record<string, unknown> = {}) {
    if (shouldLog('warn')) {
      console.warn(JSON.stringify({ timestamp: new Date().toISOString(), level: 'WARN', message, ...sanitizeMeta(meta) }));
    }
  },
  error(message: string, meta: Record<string, unknown> = {}) {
    if (shouldLog('error')) {
      console.error(JSON.stringify({ timestamp: new Date().toISOString(), level: 'ERROR', message, ...sanitizeMeta(meta) }));
    }
  },
};
