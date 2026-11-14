import express from 'express';
import helmet from 'helmet';
import { corsMiddleware } from './middleware/cors.js';
import { requestIdMiddleware } from './utils/requestId.js';
import { apiRateLimiter } from './middleware/rateLimit.js';
import { errorHandler } from './middleware/errorHandler.js';
import { healthRouter } from './routes/health.js';
import { profileRouter } from './routes/profile.js';
import { liveSessionsRouter } from './routes/liveSessions.js';
import { savedSessionsRouter } from './routes/savedSessions.js';

export const app = express();

app.use(helmet({
  contentSecurityPolicy: false, // Allows flexible integration in dev
}));
app.use(corsMiddleware);
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));
app.use(requestIdMiddleware);
app.use(apiRateLimiter);

// API v1 Routes
app.use('/api/v1/health', healthRouter);
app.use('/api/v1/me', profileRouter);
app.use('/api/v1/live-sessions', liveSessionsRouter);
app.use('/api/v1/saved-sessions', savedSessionsRouter);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    error: {
      code: 'ROUTE_NOT_FOUND',
      message: `Endpoint ${req.method} ${req.originalUrl} does not exist.`,
      details: [],
    },
  });
});

// Centralized Error Handler
app.use(errorHandler);
