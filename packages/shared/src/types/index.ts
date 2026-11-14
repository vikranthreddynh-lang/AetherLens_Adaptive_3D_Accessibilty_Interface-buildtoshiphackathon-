import { z } from 'zod';
import {
  AccessibilityPreferencesSchema,
  ProfileUpdateSchema,
  EventTypeSchema,
  EventCertaintySchema,
  EventPrioritySchema,
  SourceModalitySchema,
  RelativePositionSchema,
  ModelDetectedEventSchema,
  ModelEventBatchResponseSchema,
  EnvironmentalEventSchema,
  RenderedSensoryCueSchema,
  LocalVisualObservationSchema,
  EnvironmentTypeSchema,
  CreateLiveSessionRequestSchema,
  LiveSessionTicketResponseSchema,
  SessionFeedbackSchema,
  SaveSessionRequestSchema,
  SavedSessionRecordSchema,
  SavedEventRecordSchema,
  SessionSummarySchema,
  WsClientMessageSchema,
  WsServerMessageSchema,
} from '../schemas/index.js';

export type AccessibilityPreferences = z.infer<typeof AccessibilityPreferencesSchema>;
export type ProfileUpdate = z.infer<typeof ProfileUpdateSchema>;

export type EventType = z.infer<typeof EventTypeSchema>;
export type EventCertainty = z.infer<typeof EventCertaintySchema>;
export type EventPriority = z.infer<typeof EventPrioritySchema>;
export type SourceModality = z.infer<typeof SourceModalitySchema>;
export type RelativePosition = z.infer<typeof RelativePositionSchema>;

export type ModelDetectedEvent = z.infer<typeof ModelDetectedEventSchema>;
export type ModelEventBatchResponse = z.infer<typeof ModelEventBatchResponseSchema>;
export type EnvironmentalEvent = z.infer<typeof EnvironmentalEventSchema>;
export type RenderedSensoryCue = z.infer<typeof RenderedSensoryCueSchema>;
export type LocalVisualObservation = z.infer<typeof LocalVisualObservationSchema>;

export type EnvironmentType = z.infer<typeof EnvironmentTypeSchema>;
export type CreateLiveSessionRequest = z.infer<typeof CreateLiveSessionRequestSchema>;
export type LiveSessionTicketResponse = z.infer<typeof LiveSessionTicketResponseSchema>;
export type SessionFeedback = z.infer<typeof SessionFeedbackSchema>;
export type SaveSessionRequest = z.infer<typeof SaveSessionRequestSchema>;
export type SavedSessionRecord = z.infer<typeof SavedSessionRecordSchema>;
export type SavedEventRecord = z.infer<typeof SavedEventRecordSchema>;

export type SessionSummary = z.infer<typeof SessionSummarySchema>;

export type WsClientMessage = z.infer<typeof WsClientMessageSchema>;
export type WsServerMessage = z.infer<typeof WsServerMessageSchema>;
