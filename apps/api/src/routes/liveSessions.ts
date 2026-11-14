import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import {
  CreateLiveSessionRequestSchema,
  SessionFeedbackSchema,
  SaveSessionRequestSchema,
} from '@senseweave/shared';
import { optionalAuth, requireAuth } from '../middleware/authentication.js';
import { RequestWithId } from '../utils/requestId.js';
import { checkGuestSessionLimit, trackGuestSessionStart } from '../middleware/rateLimit.js';
import { sessionManager } from '../services/sessions/sessionManager.js';
import { ticketStore } from '../services/sessions/ticketStore.js';
import { generateSessionSummary } from '../services/gemini/summary.js';
import { saveLiveSession } from '../services/supabase/savedSessions.js';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

export const liveSessionsRouter = Router();

liveSessionsRouter.post('/', optionalAuth, async (req: RequestWithId, res, next) => {
  try {
    const validated = CreateLiveSessionRequestSchema.parse(req.body);
    const userId = req.user?.id || null;
    const ip = req.ip || 'anonymous';

    // Rate limit guest sessions
    if (!userId) {
      if (!checkGuestSessionLimit(ip)) {
        res.status(429).json({
          error: {
            code: 'GUEST_LIMIT_REACHED',
            message: 'Too many concurrent guest sessions from this location. Sign in to continue.',
            details: [],
          },
        });
        return;
      }
      trackGuestSessionStart(ip);
    }

    const sessionId = uuidv4();

    // Register active session
    sessionManager.createSession(
      sessionId,
      userId,
      validated.environmentType,
      validated.outputPreferences,
      validated.selectedEventCategories,
      validated.speechTranscriptionEnabled
    );

    // Generate single-use connection ticket
    const ticket = ticketStore.createTicket(sessionId, userId, 60000);

    const wsUrl = `/api/v1/live?ticket=${ticket}`;

    res.status(201).json({
      sessionId,
      ticket,
      wsUrl,
      expiresAt: new Date(Date.now() + 60000).toISOString(),
      maxDurationMs: env.LIVE_SESSION_MAX_DURATION_MS,
      environmentType: validated.environmentType,
    });
  } catch (err) {
    next(err);
  }
});

liveSessionsRouter.post('/:id/ticket', optionalAuth, (req: RequestWithId, res, next) => {
  try {
    const sessionId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const session = sessionManager.getSession(sessionId);
    if (!session) {
      res.status(404).json({
        error: {
          code: 'SESSION_NOT_FOUND',
          message: 'Active session not found or has already ended.',
          details: [],
        },
      });
      return;
    }

    const ticket = ticketStore.createTicket(sessionId, req.user?.id || null, 60000);
    const wsUrl = `/api/v1/live?ticket=${ticket}`;

    res.json({
      sessionId,
      ticket,
      wsUrl,
      expiresAt: new Date(Date.now() + 60000).toISOString(),
    });
  } catch (err) {
    next(err);
  }
});

liveSessionsRouter.post('/:id/stop', (req, res) => {
  const sessionId = req.params.id;
  sessionManager.stopSession(sessionId, 'Client triggered stop endpoint');
  res.json({ success: true, sessionId, status: 'stopped' });
});

liveSessionsRouter.post('/:id/feedback', (req, res, next) => {
  try {
    const sessionId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const feedback = SessionFeedbackSchema.parse(req.body);
    logger.info('Live session feedback received', { sessionId, feedbackType: feedback.feedbackType });
    res.json({ success: true, message: 'Feedback recorded anonymously.' });
  } catch (err) {
    next(err);
  }
});

liveSessionsRouter.post('/:id/summary', async (req, res, next) => {
  try {
    const sessionId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const session = sessionManager.getSession(sessionId);

    const events = session ? session.engine.getEventHistory() : [];
    const envType = session ? session.environmentType : 'group_discussion';
    const gaps = session ? session.engine.getObservationGaps() : [];

    const summary = await generateSessionSummary({
      events,
      environmentType: envType,
      observationGaps: gaps,
    });

    res.json({
      sessionId,
      summary,
      eventCount: events.length,
      events,
    });
  } catch (err) {
    next(err);
  }
});

liveSessionsRouter.post('/:id/save', requireAuth, async (req: RequestWithId, res, next) => {
  try {
    const saveRequest = SaveSessionRequestSchema.parse(req.body);
    const userId = req.user!.id;

    const saved = await saveLiveSession(userId, saveRequest);
    res.status(201).json({ session: saved });
  } catch (err) {
    next(err);
  }
});
