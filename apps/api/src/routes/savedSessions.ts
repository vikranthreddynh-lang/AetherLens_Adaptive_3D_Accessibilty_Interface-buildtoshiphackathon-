import { Router } from 'express';
import { requireAuth } from '../middleware/authentication.js';
import { RequestWithId } from '../utils/requestId.js';
import {
  listUserSavedSessions,
  getSavedSessionWithEvents,
  deleteSavedSession,
} from '../services/supabase/savedSessions.js';

export const savedSessionsRouter = Router();

savedSessionsRouter.use(requireAuth);

savedSessionsRouter.get('/', async (req: RequestWithId, res, next) => {
  try {
    const environment = req.query.environment as string | undefined;
    const sessions = await listUserSavedSessions(req.user!.id, environment);
    res.json({ sessions });
  } catch (err) {
    next(err);
  }
});

savedSessionsRouter.get('/:id', async (req: RequestWithId, res, next) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const { session, events } = await getSavedSessionWithEvents(id, req.user!.id);
    if (!session) {
      res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Saved session not found or does not belong to you.',
          details: [],
        },
      });
      return;
    }
    res.json({ session, events });
  } catch (err) {
    next(err);
  }
});

savedSessionsRouter.delete('/:id', async (req: RequestWithId, res, next) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const deleted = await deleteSavedSession(id, req.user!.id);
    if (!deleted) {
      res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Session could not be found to delete.',
          details: [],
        },
      });
      return;
    }
    res.json({ success: true, message: 'Saved session and related events deleted.' });
  } catch (err) {
    next(err);
  }
});
