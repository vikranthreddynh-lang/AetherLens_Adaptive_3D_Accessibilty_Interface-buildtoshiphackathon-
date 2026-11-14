import {
  EnvironmentalEvent,
  RenderedSensoryCue,
  AccessibilityPreferences,
} from '@senseweave/shared';
import { computeSpatialPan } from '../spatial/positionNormalizer.js';
import { selectHapticPattern } from './hapticRegistry.js';
import { renderAudioDescription } from './audioRenderer.js';

export function renderSensoryCue(
  event: EnvironmentalEvent,
  preferences?: AccessibilityPreferences
): RenderedSensoryCue {
  const spatialPref = preferences?.outputs.spatialAudio ?? false;
  const spatial = computeSpatialPan(event.relativePosition, spatialPref);
  const hapticPattern = selectHapticPattern(event.eventType, event.priority, preferences);
  const audioText = renderAudioDescription(event, spatial.spatialLabel);

  // Position string for accessible text
  const posString =
    event.relativePosition.horizontal !== 'unknown'
      ? ` (${event.relativePosition.basis === 'camera_frame' ? 'camera-' : ''}${event.relativePosition.horizontal})`
      : '';

  const certaintyPrefix =
    event.certainty === 'uncertain'
      ? 'Uncertain: '
      : event.certainty === 'insufficient'
      ? 'Limited evidence: '
      : '';

  const accessibleText = `${certaintyPrefix}${event.description}${posString}`;

  // Formatted concise Braille display token
  let brailleToken = `[${event.eventType.toUpperCase()}]`;
  if (event.eventType === 'speaker_turn' && event.speakerLabel) {
    brailleToken = `[TURN: ${event.speakerLabel}]`;
  } else if (event.eventType === 'overlapping_speech') {
    brailleToken = `[OVERLAP: voices]`;
  } else if (event.eventType === 'raised_hand') {
    brailleToken = `[HAND${posString ? ': ' + event.relativePosition.horizontal.toUpperCase() : ''}]`;
  } else if (event.eventType === 'public_announcement') {
    brailleToken = `[ANNOUNCE]`;
  }
  const brailleText = `${brailleToken} ${event.description}`;

  // Screen reader announcement
  const screenReaderAnnouncement = `${event.priority === 'high' ? 'Important: ' : ''}${accessibleText}`;

  return {
    eventId: event.id,
    renderedCue: {
      accessibleText,
      audioText,
      hapticPattern,
      spatialAudio: {
        enabled: spatial.enabled,
        pan: spatial.pan,
      },
      priority: event.priority,
      brailleText,
      screenReaderAnnouncement,
    },
    certainty: event.certainty,
    sourceModalities: event.sourceModalities,
    observedAt: event.observedAt,
  };
}
