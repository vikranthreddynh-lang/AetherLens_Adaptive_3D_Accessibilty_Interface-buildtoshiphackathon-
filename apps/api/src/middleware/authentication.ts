import { Response, NextFunction } from 'express';
import { RequestWithId } from '../utils/requestId.js';
import { getSupabaseClient } from '../services/supabase/client.js';
import { logger } from '../utils/logger.js';

export async function requireAuth(req: RequestWithId, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authentication bearer token is required.',
        details: [],
      },
    });
    return;
  }

  const token = authHeader.substring(7).trim();
  if (!token) {
    res.status(401).json({
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authentication token is empty.',
        details: [],
      },
    });
    return;
  }

  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) {
      logger.warn('Token verification failed', { error: error?.message });
      res.status(401).json({
        error: {
          code: 'INVALID_TOKEN',
          message: 'Invalid or expired authentication token.',
          details: [],
        },
      });
      return;
    }

    req.user = {
      id: data.user.id,
      email: data.user.email,
      role: data.user.role,
    };
    next();
  } catch (err: unknown) {
    logger.error('Authentication error', { err: (err as Error).message });
    res.status(401).json({
      error: {
        code: 'AUTH_ERROR',
        message: 'Could not verify authentication credentials.',
        details: [],
      },
    });
  }
}

export async function optionalAuth(req: RequestWithId, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.substring(7).trim();
  if (!token) {
    return next();
  }

  try {
    const supabase = getSupabaseClient();
    const { data } = await supabase.auth.getUser(token);
    if (data?.user) {
      req.user = {
        id: data.user.id,
        email: data.user.email,
        role: data.user.role,
      };
    }
  } catch {
    // Ignore error for optional auth
  }

  next();
}
