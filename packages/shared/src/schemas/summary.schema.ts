import { z } from 'zod';
import { EVENT_CERTAINTIES } from '../constants/index.js';

export const TimelineSummaryItemSchema = z.object({
  description: z.string().trim().min(1).max(1000),
  sourceEventIds: z.array(z.string()).max(20),
  certainty: z.enum(EVENT_CERTAINTIES),
});

export const SessionSummarySchema = z.object({
  title: z.string().trim().min(1).max(180),
  overview: z.string().trim().min(1).max(5000),
  eventTimelineSummary: z.array(TimelineSummaryItemSchema).max(40),
  conversationActivity: z.array(z.string().max(1000)).max(20),
  visualObservations: z.array(z.string().max(1000)).max(20),
  environmentalSounds: z.array(z.string().max(1000)).max(20),
  uncertainties: z.array(z.string().max(1000)).max(20),
  observationGaps: z.array(z.string().max(1000)).max(20),
});
