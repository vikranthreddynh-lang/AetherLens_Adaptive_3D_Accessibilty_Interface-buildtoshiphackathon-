import { z } from 'zod';
import {
  EVENT_TYPES,
  EVENT_CERTAINTIES,
  EVENT_PRIORITIES,
  SOURCE_MODALITIES,
  HORIZONTAL_POSITIONS,
  VERTICAL_POSITIONS,
  POSITION_BASES,
  HAPTIC_PATTERNS,
} from '../constants/index.js';

export const EventTypeSchema = z.enum(EVENT_TYPES);
export const EventCertaintySchema = z.enum(EVENT_CERTAINTIES);
export const EventPrioritySchema = z.enum(EVENT_PRIORITIES);
export const SourceModalitySchema = z.enum(SOURCE_MODALITIES);

export const RelativePositionSchema = z.object({
  horizontal: z.enum(HORIZONTAL_POSITIONS),
  vertical: z.enum(VERTICAL_POSITIONS),
  basis: z.enum(POSITION_BASES),
});

export const ModelDetectedEventSchema = z.object({
  eventType: EventTypeSchema,
  description: z.string().trim().min(1).max(500),
  observableEvidence: z.string().trim().min(1).max(500),
  sourceModalities: z.array(SourceModalitySchema).min(1).max(3),
  relativePosition: RelativePositionSchema,
  certainty: EventCertaintySchema,
  priority: EventPrioritySchema,
  speakerLabel: z.string().trim().max(30).nullable(),
});

export const ModelEventBatchResponseSchema = z.object({
  events: z.array(ModelDetectedEventSchema).max(10),
});

export const EnvironmentalEventSchema = ModelDetectedEventSchema.extend({
  id: z.string().min(1),
  sessionId: z.string().min(1),
  observedAt: z.string().datetime(),
  expiresAt: z.string().datetime(),
  status: z.enum(['active', 'updated', 'expired']),
  sequenceNumber: z.number().int().nonnegative(),
});

export const SpatialAudioParametersSchema = z.object({
  enabled: z.boolean(),
  pan: z.number().min(-1).max(1), // -1 (full left) to +1 (full right)
});

export const RenderedSensoryCueSchema = z.object({
  eventId: z.string(),
  renderedCue: z.object({
    accessibleText: z.string(),
    audioText: z.string(),
    hapticPattern: z.enum(Object.keys(HAPTIC_PATTERNS) as [keyof typeof HAPTIC_PATTERNS, ...(keyof typeof HAPTIC_PATTERNS)[]]),
    spatialAudio: SpatialAudioParametersSchema,
    priority: EventPrioritySchema,
    brailleText: z.string(),
    screenReaderAnnouncement: z.string(),
  }),
  certainty: EventCertaintySchema,
  sourceModalities: z.array(SourceModalitySchema),
  observedAt: z.string().datetime(),
});

export const LocalVisualObservationSchema = z.object({
  gestureType: z.enum(['raised_hand', 'pointing_left', 'pointing_right', 'orientation_shift', 'general_motion', 'none']),
  confidence: z.number().min(0).max(1),
  relativePosition: RelativePositionSchema,
  evidence: z.string().max(200),
  timestamp: z.number(),
});
