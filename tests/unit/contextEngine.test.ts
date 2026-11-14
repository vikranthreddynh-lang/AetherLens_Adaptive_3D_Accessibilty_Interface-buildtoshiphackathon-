import test from 'node:test';
import assert from 'node:assert';
import {
  LiveContextWeaveEngine,
} from '../../apps/api/dist/services/context/contextEngine.js';
import {
  DEFAULT_ACCESSIBILITY_PREFERENCES,
} from '../../packages/shared/dist/index.js';
import { normalizeRelativePosition, computeSpatialPan } from '../../apps/api/dist/services/spatial/positionNormalizer.js';
import { selectHapticPattern } from '../../apps/api/dist/services/cues/hapticRegistry.js';

test('LiveContextWeaveEngine - Turn Taking Transition Detection', () => {
  const emittedEvents = [];
  const emittedCues = [];

  const callbacks = {
    onEvent: (event) => emittedEvents.push(event),
    onCue: (cue) => emittedCues.push(cue),
  };

  const engine = new LiveContextWeaveEngine(
    'test_session',
    'group_discussion',
    DEFAULT_ACCESSIBILITY_PREFERENCES,
    callbacks
  );

  // 1. Speaker A starts speaking
  const event1 = {
    eventType: 'speech_activity',
    description: 'Speaker A is speaking near camera-center.',
    observableEvidence: 'Voice pitch matches Speaker A.',
    sourceModalities: ['audio'],
    relativePosition: { horizontal: 'center', vertical: 'center', basis: 'camera_frame' },
    certainty: 'clear',
    priority: 'normal',
    speakerLabel: 'Speaker A',
  };
  engine.ingestModelEvents([event1]);

  assert.strictEqual(emittedEvents.length, 1);
  assert.strictEqual(emittedEvents[0].eventType, 'speech_activity');
  assert.strictEqual(engine.getActiveSpeaker(), 'Speaker A');

  // 2. Speaker B begins speaking immediately after Speaker A
  const event2 = {
    eventType: 'speech_activity',
    description: 'Speaker B is speaking from camera-right.',
    observableEvidence: 'New vocal pattern observed.',
    sourceModalities: ['audio'],
    relativePosition: { horizontal: 'right', vertical: 'center', basis: 'camera_frame' },
    certainty: 'clear',
    priority: 'normal',
    speakerLabel: 'Speaker B',
  };
  engine.ingestModelEvents([event2]);

  assert.strictEqual(emittedEvents.length, 2);
  // Engine should have synthesized speaker_turn transition
  assert.strictEqual(emittedEvents[1].eventType, 'speaker_turn');
  assert.strictEqual(engine.getActiveSpeaker(), 'Speaker B');
  assert.ok(emittedEvents[1].description.includes('Speaker transition'));
});

test('LiveContextWeaveEngine - Event Deduplication', () => {
  const emittedEvents = [];
  const callbacks = {
    onEvent: (e) => emittedEvents.push(e),
    onCue: () => {},
  };

  const engine = new LiveContextWeaveEngine(
    'test_session_dedup',
    'classroom',
    DEFAULT_ACCESSIBILITY_PREFERENCES,
    callbacks
  );

  const repeatedHandRaise = {
    eventType: 'raised_hand',
    description: 'A person near camera-left raised one hand.',
    observableEvidence: 'Arm held high.',
    sourceModalities: ['visual'],
    relativePosition: { horizontal: 'left', vertical: 'upper', basis: 'camera_frame' },
    certainty: 'clear',
    priority: 'normal',
    speakerLabel: null,
  };

  // First ingestion
  engine.ingestModelEvents([repeatedHandRaise]);
  assert.strictEqual(emittedEvents.length, 1);

  // Consecutive identical ingestion within window
  engine.ingestModelEvents([repeatedHandRaise]);
  // Should suppress duplicate alert
  assert.strictEqual(emittedEvents.length, 1);
});

test('Spatial Position Normalizer & Stereo Panning', () => {
  const posLeft = normalizeRelativePosition({ horizontal: 'left', basis: 'camera_frame' });
  assert.strictEqual(posLeft.horizontal, 'left');
  assert.strictEqual(posLeft.basis, 'camera_frame');

  // Spatial pan with audio preference enabled
  const panResult = computeSpatialPan(posLeft, true);
  assert.strictEqual(panResult.enabled, true);
  assert.strictEqual(panResult.pan, -0.75);
  assert.strictEqual(panResult.spatialLabel, 'camera-left');

  // Spatial pan disabled when spatialAudioPreferred is false
  const panDisabled = computeSpatialPan(posLeft, false);
  assert.strictEqual(panDisabled.enabled, false);
  assert.strictEqual(panDisabled.pan, 0);

  // Unknown basis
  const unknownPos = normalizeRelativePosition({ horizontal: 'unknown' });
  const panUnknown = computeSpatialPan(unknownPos, true);
  assert.strictEqual(panUnknown.enabled, false);
  assert.strictEqual(panUnknown.spatialLabel, 'direction unknown');
});

test('Haptic Registry - Pattern Selection', () => {
  // Conversational transition
  const patternTurn = selectHapticPattern('speaker_turn', 'normal');
  assert.strictEqual(patternTurn, 'double_short');

  // Overlapping speech
  const patternOverlap = selectHapticPattern('overlapping_speech', 'normal');
  assert.strictEqual(patternOverlap, 'rapid_pulse');

  // High priority override
  const patternHigh = selectHapticPattern('public_announcement', 'high');
  assert.strictEqual(patternHigh, 'long_pulse');

  // Quiet mode suppression
  const quietPrefs = { ...DEFAULT_ACCESSIBILITY_PREFERENCES, quietMode: true };
  const patternQuiet = selectHapticPattern('door_activity', 'normal', quietPrefs);
  assert.strictEqual(patternQuiet, 'quiet');
});
