import { HAPTIC_PATTERNS, EventType, EventPriority, AccessibilityPreferences } from '@senseweave/shared';

export type HapticPatternName = keyof typeof HAPTIC_PATTERNS;

export function selectHapticPattern(
  eventType: EventType,
  priority: EventPriority,
  preferences?: AccessibilityPreferences
): HapticPatternName {
  if (preferences?.quietMode) {
    if (priority !== 'high') {
      return 'quiet';
    }
  }

  // User custom override if provided
  if (preferences?.customHapticMap && preferences.customHapticMap[eventType]) {
    const customKey = preferences.customHapticMap[eventType] as HapticPatternName;
    if (HAPTIC_PATTERNS[customKey]) {
      return customKey;
    }
  }

  // Priority-based high alerts
  if (priority === 'high') {
    return 'long_pulse';
  }

  // Event category-based mappings
  switch (eventType) {
    case 'overlapping_speech':
      return 'rapid_pulse';

    case 'speaker_turn':
      return 'double_short';

    case 'raised_hand':
    case 'pointing_gesture':
    case 'public_announcement':
    case 'display_change':
      return 'single_short';

    case 'door_activity':
    case 'attention_shift':
    case 'group_activity':
    case 'applause':
    case 'environment_sound':
      return priority === 'low' ? 'soft_alert' : 'single_short';

    case 'unknown':
    default:
      return 'soft_alert';
  }
}
