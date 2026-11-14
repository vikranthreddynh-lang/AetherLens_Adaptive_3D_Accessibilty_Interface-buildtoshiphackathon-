import { v4 as uuidv4 } from 'uuid';
import {
  SaveSessionRequest,
  SavedSessionRecord,
  SavedEventRecord,
  ProfileUpdate,
  AccessibilityPreferences,
  DEFAULT_ACCESSIBILITY_PREFERENCES,
} from '@senseweave/shared';
import { getSupabaseServiceClient } from './client.js';
import { logger } from '../../utils/logger.js';

// In-memory fallback cache in case Supabase schema migration is pending
const inMemorySessions = new Map<string, SavedSessionRecord>();
const inMemoryEvents = new Map<string, SavedEventRecord[]>();
const inMemoryProfiles = new Map<
  string,
  { displayName?: string; preferredLanguage: string; accessibilityPreferences: AccessibilityPreferences }
>();

export async function getUserProfile(userId: string) {
  try {
    const supabase = getSupabaseServiceClient();
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (!error && data) {
      return {
        id: data.id,
        displayName: data.display_name,
        preferredLanguage: data.preferred_language,
        accessibilityPreferences: data.accessibility_preferences as AccessibilityPreferences,
        updatedAt: data.updated_at,
      };
    }
  } catch (err) {
    logger.warn('Supabase profile query fallback', { err: (err as Error).message });
  }

  // Fallback to cache or defaults
  const cached = inMemoryProfiles.get(userId);
  return {
    id: userId,
    displayName: cached?.displayName || 'User',
    preferredLanguage: cached?.preferredLanguage || 'en',
    accessibilityPreferences: cached?.accessibilityPreferences || DEFAULT_ACCESSIBILITY_PREFERENCES,
    updatedAt: new Date().toISOString(),
  };
}

export async function updateUserProfile(userId: string, update: ProfileUpdate) {
  try {
    const supabase = getSupabaseServiceClient();
    const payload: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };
    if (update.displayName !== undefined) payload.display_name = update.displayName;
    if (update.preferredLanguage !== undefined) payload.preferred_language = update.preferredLanguage;
    if (update.accessibilityPreferences !== undefined) {
      payload.accessibility_preferences = update.accessibilityPreferences;
      payload.preferences_saved_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('profiles')
      .upsert({ id: userId, ...payload })
      .select()
      .single();

    if (!error && data) {
      return {
        id: data.id,
        displayName: data.display_name,
        preferredLanguage: data.preferred_language,
        accessibilityPreferences: data.accessibility_preferences,
        updatedAt: data.updated_at,
      };
    }
  } catch (err) {
    logger.warn('Supabase profile update fallback', { err: (err as Error).message });
  }

  const existing = inMemoryProfiles.get(userId) || {
    displayName: undefined,
    preferredLanguage: 'en',
    accessibilityPreferences: DEFAULT_ACCESSIBILITY_PREFERENCES,
  };

  const updated = {
    displayName: update.displayName ?? existing.displayName,
    preferredLanguage: update.preferredLanguage ?? existing.preferredLanguage,
    accessibilityPreferences: update.accessibilityPreferences ?? existing.accessibilityPreferences,
  };
  inMemoryProfiles.set(userId, updated);

  return {
    id: userId,
    ...updated,
    updatedAt: new Date().toISOString(),
  };
}

export async function saveLiveSession(
  userId: string,
  request: SaveSessionRequest
): Promise<SavedSessionRecord> {
  const sessionId = uuidv4();
  const now = new Date().toISOString();

  const record: SavedSessionRecord = {
    id: sessionId,
    userId,
    title: request.title,
    environmentType: request.environmentType,
    summary: request.summary,
    startedAt: request.startedAt || null,
    endedAt: request.endedAt,
    savedAt: now,
    createdAt: now,
    updatedAt: now,
  };

  try {
    const supabase = getSupabaseServiceClient();

    // 1. Insert session
    const { error: sessionError } = await supabase.from('saved_sessions').insert({
      id: sessionId,
      user_id: userId,
      title: request.title,
      environment_type: request.environmentType,
      summary: request.summary,
      started_at: request.startedAt || null,
      ended_at: request.endedAt,
      saved_at: now,
      created_at: now,
      updated_at: now,
    });

    if (!sessionError) {
      // 2. Insert approved events
      if (request.events && request.events.length > 0) {
        const eventsToInsert = request.events.map((evt) => ({
          id: uuidv4(),
          session_id: sessionId,
          user_id: userId,
          event_type: evt.eventType,
          description: evt.description,
          observable_evidence: evt.observableEvidence,
          source_modalities: evt.sourceModalities,
          relative_position: evt.relativePosition,
          certainty: evt.certainty,
          priority: evt.priority,
          observed_at: evt.observedAt,
          created_at: now,
        }));

        await supabase.from('saved_events').insert(eventsToInsert);
      }

      logger.info('Session saved successfully to Supabase', { sessionId, userId });
      return record;
    } else {
      logger.warn('Supabase saved_sessions insert returned error, caching in-memory', {
        error: sessionError.message,
      });
    }
  } catch (err) {
    logger.warn('Supabase exception saving session, caching in-memory', { err: (err as Error).message });
  }

  // Fallback cache
  inMemorySessions.set(sessionId, record);
  if (request.events && request.events.length > 0) {
    const savedEvts: SavedEventRecord[] = request.events.map((evt) => ({
      id: uuidv4(),
      sessionId,
      userId,
      eventType: evt.eventType,
      description: evt.description,
      observableEvidence: evt.observableEvidence,
      sourceModalities: evt.sourceModalities,
      relativePosition: evt.relativePosition,
      certainty: evt.certainty,
      priority: evt.priority,
      observedAt: evt.observedAt,
      createdAt: now,
    }));
    inMemoryEvents.set(sessionId, savedEvts);
  }

  return record;
}

export async function listUserSavedSessions(
  userId: string,
  environment?: string
): Promise<SavedSessionRecord[]> {
  try {
    const supabase = getSupabaseServiceClient();
    let query = supabase
      .from('saved_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('saved_at', { ascending: false });

    if (environment) {
      query = query.eq('environment_type', environment);
    }

    const { data, error } = await query;
    if (!error && data) {
      return data.map((d) => ({
        id: d.id,
        userId: d.user_id,
        title: d.title,
        environmentType: d.environment_type,
        summary: d.summary,
        startedAt: d.started_at,
        endedAt: d.ended_at,
        savedAt: d.saved_at,
        createdAt: d.created_at,
        updatedAt: d.updated_at,
      }));
    }
  } catch (err) {
    logger.warn('Supabase list sessions error, using memory store', { err: (err as Error).message });
  }

  // Fallback
  return Array.from(inMemorySessions.values())
    .filter((s) => s.userId === userId && (!environment || s.environmentType === environment))
    .sort((a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime());
}

export async function getSavedSessionWithEvents(sessionId: string, userId: string) {
  let sessionRecord: SavedSessionRecord | null = null;
  let events: SavedEventRecord[] = [];

  try {
    const supabase = getSupabaseServiceClient();
    const { data: sData, error: sErr } = await supabase
      .from('saved_sessions')
      .select('*')
      .eq('id', sessionId)
      .eq('user_id', userId)
      .maybeSingle();

    if (!sErr && sData) {
      sessionRecord = {
        id: sData.id,
        userId: sData.user_id,
        title: sData.title,
        environmentType: sData.environment_type,
        summary: sData.summary,
        startedAt: sData.started_at,
        endedAt: sData.ended_at,
        savedAt: sData.saved_at,
        createdAt: sData.created_at,
        updatedAt: sData.updated_at,
      };

      const { data: eData } = await supabase
        .from('saved_events')
        .select('*')
        .eq('session_id', sessionId)
        .eq('user_id', userId)
        .order('observed_at', { ascending: true });

      if (eData) {
        events = eData.map((e) => ({
          id: e.id,
          sessionId: e.session_id,
          userId: e.user_id,
          eventType: e.event_type,
          description: e.description,
          observableEvidence: e.observable_evidence,
          sourceModalities: e.source_modalities as string[],
          relativePosition: e.relative_position as Record<string, unknown>,
          certainty: e.certainty,
          priority: e.priority,
          observedAt: e.observed_at,
          createdAt: e.created_at,
        }));
      }
    }
  } catch (err) {
    logger.warn('Supabase get session error', { err: (err as Error).message });
  }

  if (!sessionRecord) {
    const mem = inMemorySessions.get(sessionId);
    if (mem && mem.userId === userId) {
      sessionRecord = mem;
      events = inMemoryEvents.get(sessionId) || [];
    }
  }

  return { session: sessionRecord, events };
}

export async function deleteSavedSession(sessionId: string, userId: string): Promise<boolean> {
  let deleted = false;
  try {
    const supabase = getSupabaseServiceClient();
    const { error } = await supabase
      .from('saved_sessions')
      .delete()
      .eq('id', sessionId)
      .eq('user_id', userId);

    if (!error) {
      deleted = true;
    }
  } catch (err) {
    logger.warn('Supabase delete session error', { err: (err as Error).message });
  }

  if (inMemorySessions.has(sessionId)) {
    const s = inMemorySessions.get(sessionId);
    if (s && s.userId === userId) {
      inMemorySessions.delete(sessionId);
      inMemoryEvents.delete(sessionId);
      deleted = true;
    }
  }

  return deleted;
}

export async function deleteUserAccountData(userId: string): Promise<boolean> {
  try {
    const supabase = getSupabaseServiceClient();
    await supabase.from('profiles').delete().eq('id', userId);
    await supabase.from('saved_sessions').delete().eq('user_id', userId);
    // Delete from auth if supported
    await supabase.auth.admin.deleteUser(userId);
  } catch (err) {
    logger.warn('Supabase account deletion cascade error', { err: (err as Error).message });
  }

  inMemoryProfiles.delete(userId);
  for (const [id, s] of inMemorySessions.entries()) {
    if (s.userId === userId) {
      inMemorySessions.delete(id);
      inMemoryEvents.delete(id);
    }
  }

  return true;
}
