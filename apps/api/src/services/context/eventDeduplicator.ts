import { EnvironmentalEvent } from '@senseweave/shared';

export interface DeduplicationResult {
  isDuplicate: boolean;
  suppressNotification: boolean;
  updatedExistingId?: string;
  synthesizedEvent?: EnvironmentalEvent;
}

export class EventDeduplicator {
  private recentEvents: EnvironmentalEvent[] = [];
  private readonly windowMs: number;

  constructor(windowMs = 12000) {
    this.windowMs = windowMs;
  }

  public process(newEvent: EnvironmentalEvent): DeduplicationResult {
    const now = Date.now();
    this.clean(now);

    // Find any very similar recent event
    const match = this.recentEvents.find((existing) => {
      // Same event type
      if (existing.eventType !== newEvent.eventType) return false;

      // For speech: if it's the exact same speaker continuing to speak
      if (
        (existing.eventType === 'speech_activity' || existing.eventType === 'overlapping_speech') &&
        existing.speakerLabel === newEvent.speakerLabel
      ) {
        return true;
      }

      // For gestures: same gesture in same horizontal location
      if (
        (existing.eventType === 'raised_hand' || existing.eventType === 'pointing_gesture') &&
        existing.relativePosition.horizontal === newEvent.relativePosition.horizontal
      ) {
        return true;
      }

      // For identical descriptions within window
      if (existing.description.toLowerCase() === newEvent.description.toLowerCase()) {
        return true;
      }

      return false;
    });

    if (match) {
      // It is an unchanged ongoing state.
      // Update its expiration time without firing a brand-new jarring announcement
      match.expiresAt = newEvent.expiresAt;
      match.observableEvidence = newEvent.observableEvidence;
      return {
        isDuplicate: true,
        suppressNotification: true,
        updatedExistingId: match.id,
      };
    }

    // New meaningful observation
    this.recentEvents.push(newEvent);
    return {
      isDuplicate: false,
      suppressNotification: false,
    };
  }

  private clean(now: number) {
    this.recentEvents = this.recentEvents.filter((e) => {
      const exp = new Date(e.expiresAt).getTime();
      return exp > now;
    });
  }

  public reset() {
    this.recentEvents = [];
  }
}
