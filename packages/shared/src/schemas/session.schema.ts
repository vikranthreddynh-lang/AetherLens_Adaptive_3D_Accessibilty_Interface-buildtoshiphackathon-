import { z } from 'zod';
import { ENVIRONMENT_TYPES, EVENT_TYPES } from '../constants/index.js';
import { AccessibilityPreferencesSchema } from './preferences.schema.js';
import { EnvironmentalEventSchema } from './event.schema.js';

export const EnvironmentTypeSchema = z.enum(ENVIRONMENT_TYPES);

export const LiveSessionInputsSchema = z.object({
  audio: z.boolean().default(true),
  video: z.boolean().default(false),
});

export const CreateLiveSessionRequestSchema = z.object({
  environmentType: EnvironmentTypeSchema.default('group_discussion'),
  enabledInputs: LiveSessionInputsSchema.default({ audio: true, video: false }),
  outputPreferences: AccessibilityPreferencesSchema.optional(),
  speechTranscriptionEnabled: z.boolean().default(false),
  selectedEventCategories: z.array(z.enum(EVENT_TYPES)).optional(),
  sessionConsentVersion: z.string().min(1).default('v1'),
});

export const LiveSessionTicketResponseSchema = z.object({
  sessionId: z.string(),
  ticket: z.string(),
  wsUrl: z.string(),
  expiresAt: z.string().datetime(),
  maxDurationMs: z.number().int().positive(),
  environmentType: EnvironmentTypeSchema,
});

export const SessionFeedbackSchema = z.object({
  feedbackType: z.enum([
    'useful_cue',
    'missed_event',
    'incorrect_event',
    'too_many_alerts',
    'insufficient_detail',
  ]),
  notes: z.string().max(500).optional(),
});

export const SaveSessionRequestSchema = z.object({
  title: z.string().trim().min(1).max(180),
  summary: z.string().trim().min(1).max(12000),
  environmentType: EnvironmentTypeSchema,
  startedAt: z.string().datetime().nullable().optional(),
  endedAt: z.string().datetime(),
  events: z.array(EnvironmentalEventSchema).max(500).optional().default([]),
});

export const SavedSessionRecordSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  title: z.string(),
  environmentType: EnvironmentTypeSchema,
  summary: z.string(),
  startedAt: z.string().datetime().nullable(),
  endedAt: z.string().datetime(),
  savedAt: z.string().datetime(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const SavedEventRecordSchema = z.object({
  id: z.string().uuid(),
  sessionId: z.string().uuid(),
  userId: z.string().uuid(),
  eventType: z.string(),
  description: z.string(),
  observableEvidence: z.string().nullable(),
  sourceModalities: z.array(z.string()),
  relativePosition: z.record(z.unknown()),
  certainty: z.enum(['clear', 'uncertain', 'insufficient']),
  priority: z.enum(['low', 'normal', 'high']),
  observedAt: z.string().datetime(),
  createdAt: z.string().datetime(),
});
