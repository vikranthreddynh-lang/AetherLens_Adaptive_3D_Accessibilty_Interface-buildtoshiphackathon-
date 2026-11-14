# SenseWeave System Architecture

## Overview

SenseWeave is an AI-powered real-time environmental awareness and social-context assistant designed primarily for DeafBlind, blind, and low-vision individuals.

Its central innovation is the **Live Context Weave Engine**, which unites multimodal sensor inputs, temporal relationship tracking, approximate spatial estimation, and deterministic sensory rendering.

```
                      +-----------------------------+
                      |   Browser Client (React)    |
                      | - getUserMedia (Audio/Video)|
                      | - Optical Motion Detector   |
                      | - Web Audio API (Spatial)   |
                      | - Vibration API (Haptics)   |
                      | - ARIA Polite/Assertive     |
                      | - Braille Terminal Display  |
                      +--------------+--------------+
                                     |
                          WebSocket (WSS) + REST
                          One-Time Single-Use Ticket
                                     |
                                     v
                      +-----------------------------+
                      |    Node.js Express + ws     |
                      | - Helmet & CORS Security    |
                      | - Ephemeral Ticket Store    |
                      | - Rate Limiters (Guest/Auth)|
                      +--------------+--------------+
                                     |
               +---------------------+---------------------+
               |                                           |
               v                                           v
+-------------------------------+           +-------------------------------+
|   Live Context Weave Engine   |           |    Google Gemini Live Bridge  |
| - Event Normalizer            |           | - Model: gemini-3.8-flash     |
| - Event Deduplicator          | <-------> | - Strict JSON Event Parsing   |
| - Temporal Graph & Turns      |           | - Resilient Fallback Cascade  |
| - Deterministic Sensory Cues  |           | - Zero Raw Media Storage      |
| - Expiration Garbage Sweeper  |           +-------------------------------+
+---------------+---------------+
                |
                v (Explicit User Save Only)
+-------------------------------+
|     Supabase PostgreSQL       |
| - profiles (Preferences)      |
| - saved_sessions (Recaps)     |
| - saved_events (Timeline)     |
| - Row Level Security (RLS)    |
+-------------------------------+
```

## Core Components

### 1. Client Subsystem (`apps/web`)
- **Media Ingestion**: Samples camera frames adaptively (~1 fps) and microphone chunks (16kHz PCM).
- **On-Device Optical Detection**: Runs frame differential analysis in an offscreen canvas to capture high-confidence gestures (hand raising, pointing) with zero network latency.
- **Sensory Rendering Engine**:
  - `HapticEngine`: Drives Web Vibration API with rhythm vocabularies (`single_short`, `double_short`, `long_pulse`, `rapid_pulse`, `soft_alert`).
  - `AudioEngine`: Synthesizes pleasant earcons via Web Audio API with stereo panning node, and triggers non-overlapping speech announcements via Web Speech API.
  - `LiveRegion`: Dual-channel ARIA announcer (polite for standard events, assertive for overlaps and warnings).
  - `BrailleDisplayBox`: Emits structured bracketed tokens formatted for 40-cell and 80-cell refreshable Braille pins.

### 2. Live Context Weave Engine (`apps/api`)
- **Event Normalizer**: Validates raw detections against Zod schemas, stamps authoritative timestamps and server IDs, and assigns TTLs.
- **Event Deduplicator**: Rolling window deduplicator that suppresses repetitive notifications for ongoing states.
- **Social Turn Engine**: Tracks speaker transitions (`Speaker A -> Speaker B`) and overlapping voices.
- **Sensory Cue Resolver**: Deterministically transforms events into accessible sensory representations based on user preferences.

### 3. Gemini Multimodal Bridge (`apps/api`)
- Direct integration via official `@google/genai` SDK using `gemini-3.8-flash`.
- Uses strict JSON schema enforcement to ensure all responses conform to `ModelEventBatchResponseSchema`.
- Implements bounded queues and discards stale frames.
