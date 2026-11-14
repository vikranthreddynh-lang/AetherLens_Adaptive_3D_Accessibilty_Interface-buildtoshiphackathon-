import { WebSocket } from 'ws';
import {
  WsClientMessage,
  WsClientMessageSchema,
  WsServerMessage,
} from '@senseweave/shared';
import { sessionManager, ActiveLiveSession } from '../services/sessions/sessionManager.js';
import { logger } from '../utils/logger.js';

export function handleClientMessage(
  ws: WebSocket,
  session: ActiveLiveSession,
  rawMessage: string | Buffer
) {
  let json: unknown;
  try {
    const text = typeof rawMessage === 'string' ? rawMessage : rawMessage.toString('utf-8');
    json = JSON.parse(text);
  } catch {
    send(ws, {
      type: 'session.error',
      payload: { code: 'INVALID_JSON', message: 'Malformed JSON payload received.', fatal: false },
    });
    return;
  }

  const parsed = WsClientMessageSchema.safeParse(json);
  if (!parsed.success) {
    logger.warn('Client WebSocket message validation failed', {
      issues: parsed.error.issues,
    });
    send(ws, {
      type: 'session.error',
      payload: {
        code: 'SCHEMA_VALIDATION_ERROR',
        message: 'Invalid message payload structure.',
        fatal: false,
      },
    });
    return;
  }

  const msg = parsed.data as WsClientMessage;

  switch (msg.type) {
    case 'session.configure': {
      if (msg.payload.environmentType) {
        session.environmentType = msg.payload.environmentType;
        session.engine.updateEnvironmentType(msg.payload.environmentType);
        session.gemini.updateEnvironmentType(msg.payload.environmentType);
      }
      if (msg.payload.preferences) {
        session.preferences = msg.payload.preferences;
        session.engine.updatePreferences(msg.payload.preferences);
      }
      break;
    }

    case 'session.pause': {
      sessionManager.pauseSession(session.sessionId);
      break;
    }

    case 'session.resume': {
      sessionManager.resumeSession(session.sessionId);
      break;
    }

    case 'session.stop': {
      sessionManager.stopSession(session.sessionId, 'Client requested stop');
      break;
    }

    case 'camera.disable': {
      session.gemini.setCameraEnabled(false);
      session.engine.recordObservationGap('Camera disabled by user');
      break;
    }

    case 'camera.enable': {
      session.gemini.setCameraEnabled(true);
      break;
    }

    case 'microphone.disable': {
      session.gemini.setMicrophoneEnabled(false);
      session.engine.recordObservationGap('Microphone disabled by user');
      break;
    }

    case 'microphone.enable': {
      session.gemini.setMicrophoneEnabled(true);
      break;
    }

    case 'media.video_frame': {
      session.gemini.pushVideoFrame(
        msg.payload.data,
        msg.payload.mimeType,
        msg.payload.timestamp
      );
      break;
    }

    case 'media.audio_chunk': {
      session.gemini.pushAudioChunk(
        msg.payload.data,
        msg.payload.mimeType,
        msg.payload.timestamp
      );
      break;
    }

    case 'client.visual_observation': {
      session.engine.ingestClientVisualObservation(msg.payload.observation);
      break;
    }

    case 'preferences.update': {
      session.preferences = msg.payload.preferences;
      session.engine.updatePreferences(msg.payload.preferences);
      break;
    }

    case 'cue.acknowledge': {
      // Client confirmed receipt/rendering of cue
      break;
    }

    case 'ping': {
      send(ws, {
        type: 'pong',
        payload: { timestamp: Date.now() },
      });
      break;
    }

    default:
      break;
  }
}

function send(ws: WebSocket, message: WsServerMessage) {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(message));
  }
}
