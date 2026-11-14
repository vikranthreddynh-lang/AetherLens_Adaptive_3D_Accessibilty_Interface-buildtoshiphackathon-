# SenseWeave Event & Data Schemas

This document defines the authoritative data contracts, Zod schemas, TypeScript types, and database models used across SenseWeave.

---

## 1. Domain Enums

### Event Types (`EventType`)
Identifies the observable physical or conversational phenomenon:
- `speech_turn`: A participant begins speaking.
- `speaker_overlap`: Multiple participants speaking simultaneously.
- `hand_raise`: A visible hand raised into upper field of view.
- `pointing_gesture`: An arm/hand extended directionally.
- `attention_shift`: Physical orientation or gaze direction shift.
- `public_announcement`: Broadcast acoustic or public address message.
- `door_activity`: Door opening, closing, or latch sound/motion.
- `applause`: Coordinated clapping or audience response.
- `ambient_sound`: Repetitive background sound (alarm, transit rumble).
- `display_change`: Slide progression or digital screen text change.
- `general_movement`: Bulk movement in visible environment.

### Event Certainty (`EventCertainty`)
Classifies the confidence of the sensor observation:
- `confirmed`: Supported by multi-modal evidence or unambiguous signal.
- `likely`: Observable signal matches characteristic patterns with high probability.
- `uncertain`: Weak or ambiguous signal requiring user discretion.

### Event Priority (`EventPriority`)
Determines interruption level and haptic/audio precedence:
- `low`: Informational ambient updates (ambient hum, background movement).
- `medium`: Standard social cues (speaker turn transitions, gestures).
- `high`: Overlapping speech, hand raises, public announcements.
- `critical`: Direct warnings, high-consequence alarms.

### Relative Position (`RelativePosition`)
Camera-relative or calibrated device orientation:
- `camera_left`: Left-most third of field of view.
- `camera_center`: Central third of field of view.
- `camera_right`: Right-most third of field of view.
- `ahead`: Directly in front (visual line of sight).
- `behind`: Rear quadrant (only when supported by calibrated dual sensors).
- `unknown`: Directional origin cannot be verified.

### Source Modality (`SourceModality`)
Sensor streams that supplied evidence:
- `audio`: Microphone PCM stream.
- `camera`: Sampled video frames.
- `local_vision`: Client-side edge optical motion detector.
- `gemini_live`: Cloud multimodal LLM inference.
- `device_motion`: Browser accelerometer/gyroscope.

---

## 2. Core Event & Cue Interfaces

### `EnvironmentalEvent`
```typescript
interface EnvironmentalEvent {
  id: string;                          // Authoritative UUIDv4
  sessionId: string;                   // Active session identifier
  type: EventType;                     // Categorized event type
  description: string;                 // Concise observable text
  certainty: EventCertainty;           // confirmed | likely | uncertain
  priority: EventPriority;             // low | medium | high | critical
  relativePosition: RelativePosition;  // Spatial classification
  stereoPan: number;                   // Float between -1.0 (left) and +1.0 (right)
  sourceModalities: SourceModality[];  // Array of modalities providing evidence
  observableEvidence: string;          // Direct sensory evidence statement
  speakerLabel?: string;               // Anonymous identifier (e.g., "Speaker A")
  timestamp: number;                   // UTC epoch timestamp in milliseconds
  ttlMs: number;                       // Active lifespan in milliseconds
}
```

### `RenderedSensoryCue`
```typescript
interface RenderedSensoryCue {
  id: string;                          // Authoritative UUIDv4
  eventId: string;                     // Corresponding EnvironmentalEvent.id
  timestamp: number;                   // UTC epoch milliseconds
  accessibleText: string;              // Plain-language readable text
  audioDescription?: string;           // TTS-ready verbal description
  earconType?: 'chirp_turn' | 'bell_gesture' | 'chime_overlap' | 'low_hum_ambient' | 'warning_tone';
  stereoPan: number;                   // -1.0 to +1.0
  hapticPattern: 'single_short' | 'double_short' | 'long_pulse' | 'rapid_pulse' | 'soft_alert' | 'warning' | 'quiet';
  hapticDurationMs: number;            // Total duration of vibration pattern
  brailleToken: string;                // Formatted 40/80-cell pin string (e.g. "[SPK-A]")
  ariaLive: 'polite' | 'assertive';    // ARIA live channel
}
```

### `AccessibilityPreferences`
```typescript
interface AccessibilityPreferences {
  tactileEnabled: boolean;
  hapticIntensity: 'soft' | 'medium' | 'strong';
  audioEnabled: boolean;
  spatialAudioEnabled: boolean;
  speechRate: number;                  // 0.5 to 2.0 (default: 1.0)
  brailleEnabled: boolean;
  brailleCellLength: 40 | 80;
  highContrastMode: boolean;
  screenReaderOptimized: boolean;
  quietMode: boolean;
  priorityThreshold: EventPriority;    // Minimum priority to trigger sensory feedback
}
```

---

## 3. WebSocket Message Contracts

WebSocket endpoint: `/api/v1/live?ticket=<single_use_ticket>`

### Client to Server Messages (`WsClientMessage`)
```typescript
type WsClientMessage =
  | { type: 'init_session'; payload: { environmentType: EnvironmentType; preferences: AccessibilityPreferences } }
  | { type: 'audio_chunk'; payload: { pcmBase64: string; sampleRate: number; timestamp: number } }
  | { type: 'video_frame'; payload: { jpegBase64: string; width: number; height: number; timestamp: number } }
  | { type: 'local_observation'; payload: LocalVisualObservation }
  | { type: 'update_preferences'; payload: Partial<AccessibilityPreferences> }
  | { type: 'ping'; payload: { timestamp: number } };
```

### Server to Client Messages (`WsServerMessage`)
```typescript
type WsServerMessage =
  | { type: 'session_ready'; payload: { sessionId: string; startedAt: number; environmentType: EnvironmentType } }
  | { type: 'event_detected'; payload: { event: EnvironmentalEvent; cue: RenderedSensoryCue } }
  | { type: 'sensory_cue'; payload: RenderedSensoryCue }
  | { type: 'speaker_turn_update'; payload: { activeSpeaker: string | null; turnCount: number; overlappingSpeakers: string[] } }
  | { type: 'session_summary'; payload: SessionSummary }
  | { type: 'error'; payload: { code: string; message: string; fatal: boolean } }
  | { type: 'pong'; payload: { timestamp: number } };
```

---

## 4. PostgreSQL Database Schema

```sql
-- Profiles: Stores user-specific sensory preferences & auth linkage
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  display_name TEXT,
  preferred_language TEXT DEFAULT 'en-US',
  accessibility_preferences JSONB NOT NULL DEFAULT '{...}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Saved Sessions: Stored recaps saved with explicit user intent
CREATE TABLE saved_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  environment_type TEXT NOT NULL,
  title TEXT NOT NULL,
  started_at TIMESTAMPTZ NOT NULL,
  ended_at TIMESTAMPTZ NOT NULL,
  duration_seconds INTEGER NOT NULL,
  summary_text TEXT NOT NULL,
  key_points JSONB NOT NULL DEFAULT '[]',
  speaker_turns JSONB NOT NULL DEFAULT '[]',
  user_rating INTEGER CHECK (user_rating BETWEEN 1 AND 5),
  user_feedback TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Saved Events: Chronological timeline for saved sessions
CREATE TABLE saved_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES saved_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  description TEXT NOT NULL,
  certainty TEXT NOT NULL,
  priority TEXT NOT NULL,
  relative_position TEXT NOT NULL,
  stereo_pan NUMERIC(3,2) NOT NULL DEFAULT 0.0,
  speaker_label TEXT,
  timestamp TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

## 5. Sample Event & Cue JSON Payload

```json
{
  "type": "event_detected",
  "payload": {
    "event": {
      "id": "e9b72a6b-7431-4822-9ab1-a96d2109cf52",
      "sessionId": "a1c43b9d-5120-4371-bd12-f0462719a421",
      "type": "speaker_overlap",
      "description": "Speaker B began speaking while Speaker A was speaking",
      "certainty": "confirmed",
      "priority": "high",
      "relativePosition": "camera_left",
      "stereoPan": -0.75,
      "sourceModalities": ["audio", "gemini_live"],
      "observableEvidence": "Simultaneous vocal acoustic energy from two distinct audio sources",
      "speakerLabel": "Speaker B",
      "timestamp": 1763102450123,
      "ttlMs": 10000
    },
    "cue": {
      "id": "c1f83421-2309-4781-81b4-e29d7401a882",
      "eventId": "e9b72a6b-7431-4822-9ab1-a96d2109cf52",
      "timestamp": 1763102450123,
      "accessibleText": "Overlapping speech: Speaker B speaking at left",
      "audioDescription": "Speaker B began speaking while Speaker A was speaking, camera left",
      "earconType": "chime_overlap",
      "stereoPan": -0.75,
      "hapticPattern": "rapid_pulse",
      "hapticDurationMs": 280,
      "brailleToken": "[OVRLAP: A+B (L)]",
      "ariaLive": "assertive"
    }
  }
}
```
