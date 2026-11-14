import { z } from 'zod';
import { ENVIRONMENT_TYPES, EVENT_TYPES } from '../constants/index.js';
import { EnvironmentalEventSchema, RenderedSensoryCueSchema, LocalVisualObservationSchema } from './event.schema.js';
import { AccessibilityPreferencesSchema } from './preferences.schema.js';

// Client -> Server Messages
export const WsClientConfigureSchema = z.object({
  type: z.literal('session.configure'),
  payload: z.object({
    environmentType: z.enum(ENVIRONMENT_TYPES).optional(),
    outputs: z.array(z.string()).optional(),
    eventCategories: z.array(z.enum(EVENT_TYPES)).optional(),
    preferences: AccessibilityPreferencesSchema.optional(),
  }),
});

export const WsClientControlSchema = z.object({
  type: z.enum([
    'session.pause',
    'session.resume',
    'session.stop',
    'camera.disable',
    'camera.enable',
    'microphone.disable',
    'microphone.enable',
  ]),
  payload: z.record(z.unknown()).optional().default({}),
});

export const WsClientPreferencesUpdateSchema = z.object({
  type: z.literal('preferences.update'),
  payload: z.object({
    preferences: AccessibilityPreferencesSchema,
  }),
});

export const WsClientCueAckSchema = z.object({
  type: z.literal('cue.acknowledge'),
  payload: z.object({
    eventId: z.string(),
  }),
});

export const WsClientVisualObservationSchema = z.object({
  type: z.literal('client.visual_observation'),
  payload: z.object({
    observation: LocalVisualObservationSchema,
  }),
});

export const WsClientMediaFrameSchema = z.object({
  type: z.literal('media.video_frame'),
  payload: z.object({
    data: z.string().max(1048576), // max 1MB base64
    mimeType: z.string().default('image/jpeg'),
    timestamp: z.number(),
  }),
});

export const WsClientAudioChunkSchema = z.object({
  type: z.literal('media.audio_chunk'),
  payload: z.object({
    data: z.string().max(65536), // max 64KB base64 chunk
    sampleRate: z.number().int().positive().default(16000),
    mimeType: z.string().default('audio/pcm;rate=16000'),
    timestamp: z.number(),
  }),
});

export const WsClientPingSchema = z.object({
  type: z.literal('ping'),
  payload: z.object({
    timestamp: z.number().optional(),
  }).optional().default({}),
});

export const WsClientMessageSchema = z.discriminatedUnion('type', [
  WsClientConfigureSchema,
  WsClientPreferencesUpdateSchema,
  WsClientCueAckSchema,
  WsClientVisualObservationSchema,
  WsClientMediaFrameSchema,
  WsClientAudioChunkSchema,
  WsClientPingSchema,
  z.object({ type: z.literal('session.pause'), payload: z.record(z.unknown()).optional().default({}) }),
  z.object({ type: z.literal('session.resume'), payload: z.record(z.unknown()).optional().default({}) }),
  z.object({ type: z.literal('session.stop'), payload: z.record(z.unknown()).optional().default({}) }),
  z.object({ type: z.literal('camera.disable'), payload: z.record(z.unknown()).optional().default({}) }),
  z.object({ type: z.literal('camera.enable'), payload: z.record(z.unknown()).optional().default({}) }),
  z.object({ type: z.literal('microphone.disable'), payload: z.record(z.unknown()).optional().default({}) }),
  z.object({ type: z.literal('microphone.enable'), payload: z.record(z.unknown()).optional().default({}) }),
]);

// Server -> Client Messages
export const WsServerReadySchema = z.object({
  type: z.literal('session.ready'),
  payload: z.object({
    sessionId: z.string(),
    environmentType: z.enum(ENVIRONMENT_TYPES),
    maxDurationMs: z.number(),
    serverTime: z.string(),
  }),
});

export const WsServerStatusSchema = z.object({
  type: z.literal('session.status'),
  payload: z.object({
    state: z.enum(['active', 'paused', 'stopped']),
    elapsedMs: z.number(),
    cameraActive: z.boolean(),
    micActive: z.boolean(),
    activeSpeaker: z.string().nullable().optional(),
    recentEventCount: z.number(),
    message: z.string().optional(),
  }),
});

export const WsServerEventSchema = z.object({
  type: z.literal('environment.event'),
  payload: z.object({
    event: EnvironmentalEventSchema,
  }),
});

export const WsServerCueSchema = z.object({
  type: z.literal('environment.cue'),
  payload: z.object({
    cue: RenderedSensoryCueSchema,
  }),
});

export const WsServerWarningSchema = z.object({
  type: z.literal('environment.warning'),
  payload: z.object({
    code: z.string(),
    message: z.string(),
    severity: z.enum(['info', 'warning', 'error']),
  }),
});

export const WsServerReconnectingSchema = z.object({
  type: z.literal('session.reconnecting'),
  payload: z.object({
    attempt: z.number(),
    maxAttempts: z.number(),
    delayMs: z.number(),
  }),
});

export const WsServerErrorSchema = z.object({
  type: z.literal('session.error'),
  payload: z.object({
    code: z.string(),
    message: z.string(),
    fatal: z.boolean(),
  }),
});

export const WsServerEndedSchema = z.object({
  type: z.literal('session.ended'),
  payload: z.object({
    sessionId: z.string(),
    reason: z.string(),
    finalEventCount: z.number(),
  }),
});

export const WsServerPongSchema = z.object({
  type: z.literal('pong'),
  payload: z.object({
    timestamp: z.number().optional(),
  }),
});

export const WsServerMessageSchema = z.discriminatedUnion('type', [
  WsServerReadySchema,
  WsServerStatusSchema,
  WsServerEventSchema,
  WsServerCueSchema,
  WsServerWarningSchema,
  WsServerReconnectingSchema,
  WsServerErrorSchema,
  WsServerEndedSchema,
  WsServerPongSchema,
]);
