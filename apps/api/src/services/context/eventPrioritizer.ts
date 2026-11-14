import {
  EventType,
  EventPriority,
  EnvironmentType,
  ENVIRONMENT_PROFILES_INFO,
} from '@senseweave/shared';

export function calculateEventPriority(
  eventType: EventType,
  environmentType: EnvironmentType,
  explicitPriority?: EventPriority
): EventPriority {
  // Respect explicit high priority if validated
  if (explicitPriority === 'high') {
    return 'high';
  }

  const profile = ENVIRONMENT_PROFILES_INFO[environmentType];
  if (!profile) {
    return explicitPriority || 'normal';
  }

  const isProfilePriority = (profile.priorities as readonly string[]).includes(eventType);

  if (isProfilePriority) {
    if (eventType === 'public_announcement' || eventType === 'overlapping_speech') {
      return 'high';
    }
    return 'normal';
  }

  if (eventType === 'unknown' || eventType === 'environment_sound') {
    return 'low';
  }

  return explicitPriority || 'normal';
}
