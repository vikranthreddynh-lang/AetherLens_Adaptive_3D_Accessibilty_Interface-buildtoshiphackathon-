import { EnvironmentalEvent } from '@senseweave/shared';

export function renderAudioDescription(event: EnvironmentalEvent, spatialLabel?: string): string {
  const loc = spatialLabel && spatialLabel !== 'direction unknown' ? ` near ${spatialLabel}` : '';

  switch (event.eventType) {
    case 'overlapping_speech':
      return 'Multiple voices are speaking simultaneously.';

    case 'speaker_turn':
      if (event.speakerLabel) {
        return `Turn transition. Now speaking: ${event.speakerLabel}.`;
      }
      return 'A new speaker began speaking.';

    case 'speech_activity':
      if (event.speakerLabel) {
        return `${event.speakerLabel} is speaking.`;
      }
      return 'Speech detected.';

    case 'raised_hand':
      return `A person${loc} raised one hand.`;

    case 'pointing_gesture':
      return `A person${loc} is visibly pointing.`;

    case 'attention_shift':
      return `Visible group orientation has shifted${loc}.`;

    case 'public_announcement':
      return `Public announcement started.`;

    case 'applause':
      return `Applause detected.`;

    case 'door_activity':
      return `Door movement observed${loc}.`;

    case 'display_change':
      return `Shared display content changed.`;

    case 'environment_sound':
      return `${event.description}${loc}.`;

    default:
      return `${event.description}`;
  }
}
