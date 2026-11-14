import { EnvironmentalEvent } from '@senseweave/shared';

export class EventExpiryManager {
  public sweep(events: EnvironmentalEvent[], now = Date.now()): {
    active: EnvironmentalEvent[];
    expired: EnvironmentalEvent[];
  } {
    const active: EnvironmentalEvent[] = [];
    const expired: EnvironmentalEvent[] = [];

    for (const evt of events) {
      const expTime = new Date(evt.expiresAt).getTime();
      if (expTime <= now) {
        evt.status = 'expired';
        expired.push(evt);
      } else {
        active.push(evt);
      }
    }

    return { active, expired };
  }
}
