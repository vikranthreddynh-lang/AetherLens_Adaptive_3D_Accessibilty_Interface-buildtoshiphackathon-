export const PRODUCT_NAME = 'SenseWeave' as const;
export const TAGLINE = 'Experience the world through the signals that reach you.' as const;

export const ENVIRONMENT_TYPES = [
  'networking',
  'group_discussion',
  'classroom',
  'public_transit',
  'general_public_space',
  'custom',
] as const;

export const EVENT_CERTAINTIES = ['clear', 'uncertain', 'insufficient'] as const;

export const EVENT_PRIORITIES = ['low', 'normal', 'high'] as const;

export const SOURCE_MODALITIES = ['audio', 'visual', 'local_visual', 'text'] as const;

export const HORIZONTAL_POSITIONS = ['left', 'center', 'right', 'unknown'] as const;
export const VERTICAL_POSITIONS = ['upper', 'center', 'lower', 'unknown'] as const;
export const POSITION_BASES = ['camera_frame', 'calibrated_device', 'multichannel_audio', 'unknown'] as const;

export const EVENT_TYPES = [
  'speech_activity',
  'speaker_turn',
  'overlapping_speech',
  'raised_hand',
  'pointing_gesture',
  'attention_shift',
  'public_announcement',
  'applause',
  'environment_sound',
  'door_activity',
  'group_activity',
  'display_change',
  'object_movement',
  'unknown',
] as const;

export const HAPTIC_PATTERNS = {
  single_short: [80],               // New relevant event
  double_short: [70, 50, 70],        // Conversational transition
  long_pulse: [220],                 // High-priority information
  rapid_pulse: [50, 40, 50, 40, 50], // Overlapping events or interruption
  soft_alert: [40],                  // Background update / low priority
  warning: [120, 80, 180],           // Interruption or system alert
  quiet: [],                         // Muted haptic
} as const;

export const DEFAULT_ACCESSIBILITY_PREFERENCES = {
  outputs: {
    audio: true,
    haptics: false,
    accessibleText: true,
    brailleCompatible: true,
    visualTimeline: false,
    spatialAudio: false,
  },
  detailLevel: 'balanced',
  quietMode: false,
  speechRate: 1.0,
  hapticVocabulary: 'standard',
} as const;

export const ENVIRONMENT_PROFILES_INFO = {
  networking: {
    label: 'Networking Event',
    description: 'Prioritizes speaker transitions, overlapping conversations, group activity, hand raises, and announcements.',
    priorities: ['speaker_turn', 'overlapping_speech', 'raised_hand', 'public_announcement'],
  },
  group_discussion: {
    label: 'Group Discussion / Brainstorming',
    description: 'Focuses on turn-taking, speaking overlaps, hand raises, shared screen references, and attention changes.',
    priorities: ['speaker_turn', 'overlapping_speech', 'raised_hand', 'pointing_gesture'],
  },
  classroom: {
    label: 'Classroom / Workshop',
    description: 'Prioritizes presenter activity, student hand raising, display updates, and classroom announcements.',
    priorities: ['raised_hand', 'display_change', 'public_announcement', 'speaker_turn'],
  },
  public_transit: {
    label: 'Public Transit Environment',
    description: 'Prioritizes public announcements, chimes, transit screen updates, and environmental sounds. (Not for navigation).',
    priorities: ['public_announcement', 'environment_sound', 'display_change'],
  },
  general_public_space: {
    label: 'General Public Space',
    description: 'Broad awareness of sound changes, group movements, and nearby observable activity.',
    priorities: ['public_announcement', 'door_activity', 'environment_sound'],
  },
  custom: {
    label: 'Custom Environment',
    description: 'User-configured prioritization and event selection.',
    priorities: [],
  },
} as const;
