import { WebSocket } from 'ws';
import {
  EnvironmentType,
  AccessibilityPreferences,
  DEFAULT_ACCESSIBILITY_PREFERENCES,
  EnvironmentalEvent,
  RenderedSensoryCue,
  WsServerMessage,
} from '@senseweave/shared';
import { LiveContextWeaveEngine } from '../context/contextEngine.js';
import { GeminiLiveBridgeSession } from '../gemini/liveSession.js';
import { env } from '../../config/env.js';
import { logger } from '../../utils/logger.js';

export interface ActiveLiveSession {
  sessionId: string;
  userId: string | null;
  environmentType: EnvironmentType;
  preferences: AccessibilityPreferences;
  createdAt: number;
  startedAt: number;
  endedAt: number | null;
  state: 'active' | 'paused' | 'stopped';
  engine: LiveContextWeaveEngine;
  gemini: GeminiLiveBridgeSession;
  sockets: Set<WebSocket>;
  maxDurationTimeout: NodeJS.Timeout;
}

export class SessionManager {
  private sessions = new Map<string, ActiveLiveSession>();

  public createSession(
    sessionId: string,
    userId: string | null,
    environmentType: EnvironmentType,
    preferences?: AccessibilityPreferences,
    selectedCategories?: string[],
    speechTranscriptionEnabled = false
  ): ActiveLiveSession {
    const prefs = preferences || DEFAULT_ACCESSIBILITY_PREFERENCES;
    const now = Date.now();

    // Context Weave Engine
    const engine = new LiveContextWeaveEngine(sessionId, environmentType, prefs, {
      onEvent: (event: EnvironmentalEvent) => {
        this.broadcast(sessionId, {
          type: 'environment.event',
          payload: { event },
        });
      },
      onCue: (cue: RenderedSensoryCue) => {
        this.broadcast(sessionId, {
          type: 'environment.cue',
          payload: { cue },
        });
      },
    });

    // Gemini Live Session Bridge
    const gemini = new GeminiLiveBridgeSession({
      sessionId,
      environmentType,
      selectedCategories,
      speechTranscriptionEnabled,
      onEventsDetected: (events) => {
        engine.ingestModelEvents(events);
      },
      onError: (err, fatal) => {
        this.broadcast(sessionId, {
          type: 'session.error',
          payload: {
            code: 'AI_STREAM_ERROR',
            message: err.message,
            fatal,
          },
        });
      },
    });

    // Enforce max duration (e.g. 5 minutes)
    const maxDurationTimeout = setTimeout(() => {
      logger.info('Session reached maximum duration limit', { sessionId });
      this.stopSession(sessionId, 'Session reached maximum permitted duration.');
    }, env.LIVE_SESSION_MAX_DURATION_MS);
    if (maxDurationTimeout.unref) {
      maxDurationTimeout.unref();
    }

    const session: ActiveLiveSession = {
      sessionId,
      userId,
      environmentType,
      preferences: prefs,
      createdAt: now,
      startedAt: now,
      endedAt: null,
      state: 'active',
      engine,
      gemini,
      sockets: new Set<WebSocket>(),
      maxDurationTimeout,
    };

    this.sessions.set(sessionId, session);
    gemini.start();

    logger.info('Live session registered in SessionManager', { sessionId, userId, environmentType });
    return session;
  }

  public getSession(sessionId: string): ActiveLiveSession | undefined {
    return this.sessions.get(sessionId);
  }

  public attachSocket(sessionId: string, socket: WebSocket) {
    const session = this.sessions.get(sessionId);
    if (!session) return;
    session.sockets.add(socket);
  }

  public detachSocket(sessionId: string, socket: WebSocket) {
    const session = this.sessions.get(sessionId);
    if (!session) return;
    session.sockets.delete(socket);
  }

  public broadcast(sessionId: string, message: WsServerMessage) {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    const payload = JSON.stringify(message);
    for (const socket of session.sockets) {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(payload);
      }
    }
  }

  public pauseSession(sessionId: string) {
    const session = this.sessions.get(sessionId);
    if (!session || session.state !== 'active') return;

    session.state = 'paused';
    session.gemini.pause();
    this.broadcast(sessionId, {
      type: 'session.status',
      payload: {
        state: 'paused',
        elapsedMs: Date.now() - session.startedAt,
        cameraActive: false,
        micActive: false,
        recentEventCount: session.engine.getActiveEvents().length,
        message: 'Session paused.',
      },
    });
  }

  public resumeSession(sessionId: string) {
    const session = this.sessions.get(sessionId);
    if (!session || session.state !== 'paused') return;

    session.state = 'active';
    session.gemini.resume();
    this.broadcast(sessionId, {
      type: 'session.status',
      payload: {
        state: 'active',
        elapsedMs: Date.now() - session.startedAt,
        cameraActive: true,
        micActive: true,
        recentEventCount: session.engine.getActiveEvents().length,
        message: 'Session resumed.',
      },
    });
  }

  public stopSession(sessionId: string, reason = 'User requested stop') {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    session.state = 'stopped';
    session.endedAt = Date.now();
    clearTimeout(session.maxDurationTimeout);

    session.gemini.stop();

    const finalCount = session.engine.getEventHistory().length;
    this.broadcast(sessionId, {
      type: 'session.ended',
      payload: {
        sessionId,
        reason,
        finalEventCount: finalCount,
      },
    });

    // Close connected sockets cleanly
    for (const socket of session.sockets) {
      if (socket.readyState === WebSocket.OPEN) {
        socket.close(1000, 'Session ended cleanly');
      }
    }
    session.sockets.clear();

    logger.info('Session ended and cleaned up', { sessionId, reason, finalCount });
  }

  public removeSession(sessionId: string) {
    this.stopSession(sessionId, 'Session removed');
    this.sessions.delete(sessionId);
  }
}

export const sessionManager = new SessionManager();
