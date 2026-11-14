import { v4 as uuidv4 } from 'uuid';
import {
  ModelDetectedEvent,
  EnvironmentalEvent,
  EnvironmentType,
  LocalVisualObservation,
} from '@senseweave/shared';
import { normalizeRelativePosition } from '../spatial/positionNormalizer.js';
import { calculateEventPriority } from './eventPrioritizer.js';

export function normalizeModelEvent(
  raw: ModelDetectedEvent,
  sessionId: string,
  environmentType: EnvironmentType,
  sequenceNumber: number
): EnvironmentalEvent {
  const now = new Date();
  const observedAt = now.toISOString();

  // Lifecycle TTL based on event type
  let ttlMs = 25000; // default 25 seconds
  if (raw.eventType === 'speech_activity' || raw.eventType === 'overlapping_speech') {
    ttlMs = 12000; // speech events are short-lived
  } else if (raw.eventType === 'public_announcement' || raw.eventType === 'display_change') {
    ttlMs = 45000; // announcements and screen changes persist longer
  }

  const expiresAt = new Date(now.getTime() + ttlMs).toISOString();
  const relativePosition = normalizeRelativePosition(raw.relativePosition);
  const priority = calculateEventPriority(raw.eventType, environmentType, raw.priority);

  return {
    id: `evt_${uuidv4().replace(/-/g, '').slice(0, 16)}`,
    sessionId,
    eventType: raw.eventType,
    description: raw.description.trim(),
    observableEvidence: raw.observableEvidence?.trim() || 'Observed via sensory stream',
    sourceModalities: raw.sourceModalities,
    relativePosition,
    certainty: raw.certainty,
    priority,
    speakerLabel: raw.speakerLabel?.trim() || null,
    observedAt,
    expiresAt,
    status: 'active',
    sequenceNumber,
  };
}

export function normalizeLocalVisualObservation(
  obs: LocalVisualObservation,
  sessionId: string,
  environmentType: EnvironmentType,
  sequenceNumber: number
): EnvironmentalEvent | null {
  if (obs.gestureType === 'none' || obs.confidence < 0.5) {
    return null;
  }

  const now = new Date();
  const observedAt = now.toISOString();
  const expiresAt = new Date(now.getTime() + 15000).toISOString();

  let eventType: EnvironmentalEvent['eventType'] = 'unknown';
  let description = 'Observable motion detected';

  const pos = normalizeRelativePosition(obs.relativePosition);
  const posLabel = pos.horizontal !== 'unknown' ? ` near camera-${pos.horizontal}` : '';

  if (obs.gestureType === 'raised_hand') {
    eventType = 'raised_hand';
    description = `A person${posLabel} raised one hand.`;
  } else if (obs.gestureType === 'pointing_left' || obs.gestureType === 'pointing_right') {
    eventType = 'pointing_gesture';
    description = `A person${posLabel} is visibly pointing.`;
  } else if (obs.gestureType === 'orientation_shift') {
    eventType = 'attention_shift';
    description = `Visible orientation shifted${posLabel}.`;
  } else if (obs.gestureType === 'general_motion') {
    eventType = 'object_movement';
    description = `Observable movement detected${posLabel}.`;
  }

  const certainty = obs.confidence > 0.8 ? 'clear' : 'uncertain';
  const priority = calculateEventPriority(eventType, environmentType, 'normal');

  return {
    id: `evt_local_${uuidv4().replace(/-/g, '').slice(0, 16)}`,
    sessionId,
    eventType,
    description,
    observableEvidence: obs.evidence || `Client-side visual observation (confidence: ${(obs.confidence * 100).toFixed(0)}%)`,
    sourceModalities: ['local_visual'],
    relativePosition: pos,
    certainty,
    priority,
    speakerLabel: null,
    observedAt,
    expiresAt,
    status: 'active',
    sequenceNumber,
  };
}
