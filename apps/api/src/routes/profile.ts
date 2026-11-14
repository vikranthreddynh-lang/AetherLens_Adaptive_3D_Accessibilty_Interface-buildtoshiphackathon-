import { Router } from 'express';
import { requireAuth } from '../middleware/authentication.js';
import { RequestWithId } from '../utils/requestId.js';
import { ProfileUpdateSchema } from '@senseweave/shared';
import {
  getUserProfile,
  updateUserProfile,
  deleteUserAccountData,
} from '../services/supabase/savedSessions.js';

export const profileRouter = Router();

profileRouter.use(requireAuth);

profileRouter.get('/', async (req: RequestWithId, res, next) => {
  try {
    const profile = await getUserProfile(req.user!.id);
    res.json({ profile });
  } catch (err) {
    next(err);
  }
});

profileRouter.patch('/', async (req: RequestWithId, res, next) => {
  try {
    const update = ProfileUpdateSchema.parse(req.body);
    const updated = await updateUserProfile(req.user!.id, update);
    res.json({ profile: updated });
  } catch (err) {
    next(err);
  }
});

profileRouter.delete('/', async (req: RequestWithId, res, next) => {
  try {
    await deleteUserAccountData(req.user!.id);
    res.json({ success: true, message: 'Account and associated records deleted.' });
  } catch (err) {
    next(err);
  }
});
