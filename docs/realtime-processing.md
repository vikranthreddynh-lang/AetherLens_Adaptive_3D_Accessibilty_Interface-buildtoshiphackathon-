# Real-Time Environmental Processing Pipeline

## Overview

SenseWeave translates high-bandwidth environmental signals into lightweight, prioritized, user-controlled sensory cues. The real-time processing architecture is split across two execution environments:
1. **Client-Side Edge Ingestion & Local Heuristic Processing** (`apps/web`): Camera/microphone capture, motion vector analysis, audio level detection, and low-latency rendering.
2. **Server-Side Live Context Weave Engine & Multimodal AI Bridge** (`apps/api`): Deep multimodal comprehension using Google Gemini Live, temporal graph tracking, speaker turn state machine, sliding-window deduplication, and deterministic sensory cue resolution.

---

## 1. Browser Client Ingestion Pipeline

### A. Audio Ingestion
- **Audio Constraints**: Captured via `navigator.mediaDevices.getUserMedia` with echo cancellation, automatic noise suppression, and high-pass filtering enabled.
- **Format**: Resampled to 16,000 Hz, single-channel (mono) 16-bit Linear PCM audio chunks.
- **Framing**: Packaged into 250ms chunks (4,000 samples per packet).
- **Silence Gating**: Root-Mean-Square (RMS) amplitude is checked client-side. If the RMS falls below 0.01 (-40 dBFS) for more than 1,500ms, chunk transmission is throttled to conserve bandwidth while preserving background acoustic continuity.

### B. Video Sampling & Bandwidth Optimization
- **Source**: User-selected camera stream (environment-facing by default, or user-facing webcam).
- **Sampling Frequency**: Adaptive rate between 0.5 fps (low motion) and 1.0 fps (active scene changes).
- **Downscaling**: Rendered into an offscreen HTML5 canvas at `640 x 360` resolution.
- **Encoding**: Compressed as JPEG with quality factor `0.65`.
- **Payload Bound**: Target frame payload is ~25–35 KB, preventing network congestion on mobile cellular links.
- **Privacy Gating**: Video frames are transmitted only when user privacy consent is granted and camera toggle is active.

### C. On-Device Edge Visual Detection
To guarantee instant tactile and auditory feedback without cloud latency, SenseWeave implements an edge optical detector (`localVisualDetector.ts`) that runs directly in the browser:
- **Canvas Differential Analysis**: Maintains previous frame pixel buffers and computes frame-to-frame absolute difference grids across 3 spatial zones: Camera-Left, Camera-Center, and Camera-Right.
- **Hand-Raise Heuristic**: Detects significant vertical motion concentration (>25% pixel variance) in the upper third of any zone without whole-body displacement, triggering an immediate `hand_raise` observation with `certainty: "likely"`.
- **Pointing Gesture Heuristic**: Detects sustained asymmetric lateral motion extension from center to left or right, generating an approximate pointing directional cue.
- **Dispatch**: Edge detections are dispatched via WebSocket with `sourceModalities: ["local_vision"]` and immediately queued into the local haptic and audio engines while simultaneously synchronizing with the backend context engine.

---

## 2. Server-Side Live Context Weave Engine

The server-side engine acts as the authoritative contextual coordinator. Rather than relaying raw AI inferences directly to the user, every detection passes through a multi-stage filtering and prioritization pipeline:

```
Raw Media (Audio / Video)
          │
          ▼
┌──────────────────────────────────────────────┐
│       Google Gemini Multimodal Bridge        │
│  (gemini-3.8-flash, structured JSON stream)  │
└──────────────────────┬───────────────────────┘
                       │ Raw Observations
                       ▼
┌──────────────────────────────────────────────┐
│               Event Normalizer               │
│ - Authoritative Server UUIDv4 & Timestamp    │
│ - Strict Zod Validation & Priority Setting   │
│ - Spatial Normalization (-1.0 to +1.0)       │
└──────────────────────┬───────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────┐
│              Event Deduplicator              │
│ - Sliding window matching (default: 3,000ms) │
│ - Content similarity hashing                 │
│ - Rate suppression on static states          │
└──────────────────────┬───────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────┐
│          Social Turn & Context Graph         │
│ - Speaker tracking (Speaker A, B, C...)      │
│ - Overlap detection & turn transition        │
│ - Environmental event temporal chain         │
└──────────────────────┬───────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────┐
│          Sensory Cue Deterministic Resolver   │
│ - Maps to user's personalized profile        │
│ - Generates Haptic, Audio, Braille & ARIA    │
└──────────────────────┬───────────────────────┘
                       │
                       ▼
WebSocket Dispatch to Client (<50ms processing latency)
```

### Stage 1: Event Normalization (`eventNormalizer.ts`)
- Sanitizes incoming payload fields.
- Assigns server-generated `id`, `sessionTimestamp`, `sourceModalities`, and time-to-live (`ttlMs`, typically 8,000ms to 20,000ms depending on event type).
- Assigns `certainty` classification (`confirmed`, `likely`, `uncertain`).
- Calculates base priority (`low`, `medium`, `high`, `critical`) based on environmental profile (Networking, Classroom, Public Transit, General).

### Stage 2: Sliding-Window Deduplication (`eventDeduplicator.ts`)
- Prevents cognitive overload by suppressing repetitive alerts.
- Maintains an in-memory sliding window (default 3,000ms).
- If an event of the same type and approximate spatial origin arrives within the window with identical speaker/actor attributes, it is consolidated rather than re-announced.

### Stage 3: Social Turn State Machine (`contextEngine.ts`)
- Tracks conversational state across turns:
  - `activeSpeaker`: Anonymous identifier of current speaker.
  - `turnCount`: Total conversational turns observed.
  - `overlappingSpeakers`: Set of active voices when two or more participants speak simultaneously.
- When `Speaker B` begins while `Speaker A` is active:
  - Emits `speaker_overlap` with `priority: high`.
  - Transitions `activeSpeaker` to `Speaker B` once `Speaker A` ceases.
  - Generates descriptive sensory cues without emotional assumptions (e.g., "Speaker B began speaking while Speaker A was speaking").

### Stage 4: Stale Event Sweeping (`eventExpiry.ts`)
- An unref'd interval timer sweeps active memory every 1,000ms.
- Events whose `createdAt + ttlMs < Date.now()` are marked expired and pruned from active context buffers.

---

## 3. Gemini Multimodal Bridge (`liveSession.ts`)

### Model Selection & Resilient Fallback Cascade
SenseWeave interfaces with the official `@google/genai` SDK. Due to rapid model lifecycle evolutions across regions, the engine implements a graceful fallback cascade:
1. `gemini-3.8-flash` (Primary default for low-latency multimodal reasoning)
2. `gemini-flash-latest` (Secondary fast multimodal model)
3. `gemini-3.5-flash` (Tertiary fallback)
4. `gemini-2.5-pro` (High-reasoning failover)

### Backpressure & Bounded Media Queue
- To prevent memory leaks during slow network links, audio chunks and video frames are buffered in a FIFO ring queue with a maximum capacity of 8 items.
- If the Gemini client connection experiences latency, older frames are discarded in favor of current temporal frames (stale-drop policy).

### System Prompt & Grounding Constraints
Gemini operates under strict persona constraints:
- **Observable-Only Descriptions**: No speculation on thoughts, intentions, feelings, ethnicity, gender, or disability.
- **Temporary Speaker Labels**: Anonymous `Speaker A`, `Speaker B` tags only.
- **Strict JSON Output**: Returns JSON conforming to `ModelEventBatchResponseSchema`. Non-JSON tokens or chat formatting are rejected by the validator.

---

## 4. Deterministic Sensory Cue Translation (`cueRenderer.ts`)

Every normalized environmental event is resolved into an accessible multi-channel bundle:
1. **Accessible Text**: Concise description readable at a glance or via screen magnification.
2. **Spoken Audio Description**: Clean text string optimized for Web Speech API text-to-speech engines.
3. **Spatial Audio Earcon**:
   - Stereo panning parameter: `-1.0` (Full Left), `0.0` (Center), `+1.0` (Full Right).
   - Earcon sound type: `chirp_turn`, `bell_gesture`, `chime_overlap`, `low_hum_ambient`, `warning_tone`.
4. **Haptic Vibration Pattern**:
   - Mapped to predefined rhythmic signatures (`single_short`, `double_short`, `long_pulse`, `rapid_pulse`, `soft_alert`, `warning`).
5. **Braille Display Token**:
   - Formatted in concise 40/80-cell brackets (e.g. `[TURN: SPK-B (L)]`, `[OVRLAP: A+B]`, `[GEST: HAND-L]`).
6. **ARIA Accessibility Announcement**:
   - Polite channel for informational updates; Assertive channel for overlapping speech or safety hazards.
