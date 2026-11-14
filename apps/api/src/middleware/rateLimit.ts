import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const ipBuckets = new Map<string, RateLimitEntry>();
const guestLiveSessionBuckets = new Map<string, number>();

// Clean up expired buckets periodically
const bucketCleanup = setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of ipBuckets.entries()) {
    if (now > entry.resetAt) {
      ipBuckets.delete(key);
    }
  }
}, 60000);
if (bucketCleanup.unref) {
  bucketCleanup.unref();
}

export function apiRateLimiter(req: Request, res: Response, next: NextFunction) {
  const ip = req.ip || req.socket.remoteAddress || 'unknown-ip';
  const now = Date.now();
  const entry = ipBuckets.get(ip);

  if (!entry || now > entry.resetAt) {
    ipBuckets.set(ip, {
      count: 1,
      resetAt: now + env.RATE_LIMIT_WINDOW_MS,
    });
    return next();
  }

  entry.count += 1;
  if (entry.count > env.RATE_LIMIT_MAX_REQUESTS) {
    logger.warn('Rate limit exceeded', { ip });
    res.setHeader('Retry-After', Math.ceil((entry.resetAt - now) / 1000));
    res.status(429).json({
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many requests. Please slow down.',
        details: [{ retryAfterSeconds: Math.ceil((entry.resetAt - now) / 1000) }],
      },
    });
    return;
  }

  next();
}

export function checkGuestSessionLimit(ip: string): boolean {
  const activeCount = guestLiveSessionBuckets.get(ip) || 0;
  return activeCount < env.MAX_GUEST_SESSIONS_PER_IP;
}

export function trackGuestSessionStart(ip: string) {
  const count = guestLiveSessionBuckets.get(ip) || 0;
  guestLiveSessionBuckets.set(ip, count + 1);
}

export function trackGuestSessionEnd(ip: string) {
  const count = guestLiveSessionBuckets.get(ip) || 0;
  if (count <= 1) {
    guestLiveSessionBuckets.delete(ip);
  } else {
    guestLiveSessionBuckets.set(ip, count - 1);
  }
}
