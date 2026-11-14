import {
  EnvironmentalEvent,
  RenderedSensoryCue,
  EnvironmentType,
  AccessibilityPreferences,
  ModelDetectedEvent,
  LocalVisualObservation,
} from '@senseweave/shared';
import { normalizeModelEvent, normalizeLocalVisualObservation } from './eventNormalizer.js';
import { EventDeduplicator } from './eventDeduplicator.js';
import { EventExpiryManager } from './eventExpiry.js';
import { renderSensoryCue } from '../cues/cueRenderer.js';
import { logger } from '../../utils/logger.js';

export interface ContextEngineCallbacks {
  onEvent: (event: EnvironmentalEvent) => void;
  onCue: (cue: RenderedSensoryCue) => void;
  onEventExpired?: (event: EnvironmentalEvent) => void;
}

export class LiveContextWeaveEngine {
  private readonly sessionId: string;
  private environmentType: EnvironmentType;
  private preferences: AccessibilityPreferences;
  private callbacks: ContextEngineCallbacks;

  private deduplicator: EventDeduplicator;
  private expiryManager: EventExpiryManager;

  private sequenceCounter = 0;
  private eventHistory: EnvironmentalEvent[] = [];
  private activeEvents: Map<string, EnvironmentalEvent> = new Map();

  // Social context state tracking
  private activeSpeaker: string | null = null;
  private lastSpeakerTime = 0;
  private observationGaps: Array<{ startedAt: string; endedAt: string; reason: string }> = [];

  constructor(
    sessionId: string,
    environmentType: EnvironmentType,
    preferences: AccessibilityPreferences,
    callbacks: ContextEngineCallbacks
  ) {
    this.sessionId = sessionId;
    this.environmentType = environmentType;
    this.preferences = preferences;
    this.callbacks = callbacks;

    this.deduplicator = new EventDeduplicator();
    this.expiryManager = new EventExpiryManager();
  }

  public updatePreferences(preferences: AccessibilityPreferences) {
    this.preferences = preferences;
  }

  public updateEnvironmentType(type: EnvironmentType) {
    this.environmentType = type;
  }

  public recordObservationGap(reason: string) {
    const now = new Date().toISOString();
    this.observationGaps.push({
      startedAt: now,
      endedAt: now,
      reason,
    });
    logger.info('Observation gap recorded', { sessionId: this.sessionId, reason });
  }

  /**
   * Ingests detected events from Gemini Multimodal Live API.
   */
  public ingestModelEvents(rawEvents: ModelDetectedEvent[]) {
    for (const raw of rawEvents) {
      this.sequenceCounter += 1;
      const event = normalizeModelEvent(
        raw,
        this.sessionId,
        this.environmentType,
        this.sequenceCounter
      );

      this.processIngestedEvent(event);
    }
  }

  /**
   * Ingests on-device gesture/motion observation from client browser.
   */
  public ingestClientVisualObservation(obs: LocalVisualObservation) {
    this.sequenceCounter += 1;
    const event = normalizeLocalVisualObservation(
      obs,
      this.sessionId,
      this.environmentType,
      this.sequenceCounter
    );

    if (event) {
      this.processIngestedEvent(event);
    }
  }

  private processIngestedEvent(event: EnvironmentalEvent) {
    const now = Date.now();

    // 1. Social Turn Transition Detection
    if (event.eventType === 'speech_activity' && event.speakerLabel) {
      if (this.activeSpeaker && this.activeSpeaker !== event.speakerLabel) {
        const timeSinceLastSpeaker = now - this.lastSpeakerTime;
        if (timeSinceLastSpeaker < 4000) {
          // If speaker changed quickly while previous was active, record speaker turn
          event.eventType = 'speaker_turn';
          event.description = `Speaker transition from ${this.activeSpeaker} to ${event.speakerLabel}.`;
        }
      }
      this.activeSpeaker = event.speakerLabel;
      this.lastSpeakerTime = now;
    }

    // 2. Event Deduplication
    const dedup = this.deduplicator.process(event);
    if (dedup.isDuplicate && dedup.suppressNotification) {
      // Event is continuous unchanged state; do not spam user with new cue
      return;
    }

    // 3. Register in Active State & History
    this.activeEvents.set(event.id, event);
    this.eventHistory.push(event);

    // Keep history bounded to 500 events
    if (this.eventHistory.length > 500) {
      this.eventHistory.shift();
    }

    // 4. Deterministic Sensory Cue Rendering
    const cue = renderSensoryCue(event, this.preferences);

    // 5. Emit Event & Cue to listeners (WebSocket)
    this.callbacks.onEvent(event);
    this.callbacks.onCue(cue);

    // 6. Housekeeping: Sweep expired events
    this.sweepExpired();
  }

  public sweepExpired() {
    const now = Date.now();
    const activeList = Array.from(this.activeEvents.values());
    const { active, expired } = this.expiryManager.sweep(activeList, now);

    this.activeEvents.clear();
    for (const evt of active) {
      this.activeEvents.set(evt.id, evt);
    }

    if (expired.length > 0 && this.callbacks.onEventExpired) {
      for (const exp of expired) {
        this.callbacks.onEventExpired(exp);
      }
    }
  }

  public getEventHistory(): EnvironmentalEvent[] {
    return [...this.eventHistory];
  }

  public getActiveEvents(): EnvironmentalEvent[] {
    return Array.from(this.activeEvents.values());
  }

  public getObservationGaps() {
    return [...this.observationGaps];
  }

  public getActiveSpeaker(): string | null {
    return this.activeSpeaker;
  }

  public reset() {
    this.activeEvents.clear();
    this.deduplicator.reset();
  }
}
