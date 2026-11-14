import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { logger } from '../utils/logger.js';

export interface AppError extends Error {
  statusCode?: number;
  code?: string;
  details?: unknown[];
}

export function errorHandler(
  err: AppError,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
) {
  if (err instanceof ZodError) {
    logger.warn('Request validation error', { path: req.path, issues: err.issues });
    res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'The request could not be processed due to validation errors.',
        details: err.issues.map((issue) => ({
          path: issue.path.join('.'),
          message: issue.message,
        })),
      },
    });
    return;
  }

  const statusCode = err.statusCode || 500;
  const code = err.code || 'INTERNAL_SERVER_ERROR';
  const message = statusCode === 500 ? 'An unexpected server error occurred.' : err.message;

  logger.error('Unhandled request error', {
    path: req.path,
    code,
    statusCode,
    message: err.message,
  });

  res.status(statusCode).json({
    error: {
      code,
      message,
      details: err.details || [],
    },
  });
}
