import { HAPTIC_PATTERNS } from '@senseweave/shared';

export type HapticPatternName = keyof typeof HAPTIC_PATTERNS;

export class HapticEngine {
  private static isSupportedCached: boolean | null = null;

  public static isSupported(): boolean {
    if (this.isSupportedCached !== null) return this.isSupportedCached;
    this.isSupportedCached = typeof window !== 'undefined' && 'vibrate' in navigator;
    return this.isSupportedCached;
  }

  public static trigger(patternName: HapticPatternName | string): boolean {
    const pattern = HAPTIC_PATTERNS[patternName as HapticPatternName] || HAPTIC_PATTERNS.single_short;

    // Trigger visual/state fallback event on window
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('senseweave:haptic_fallback', {
          detail: { patternName, pattern },
        })
      );
    }

    if (this.isSupported() && pattern.length > 0) {
      try {
        return navigator.vibrate(pattern as unknown as number[]);
      } catch {
        return false;
      }
    }

    return false;
  }

  public static preview(patternName: HapticPatternName): boolean {
    return this.trigger(patternName);
  }

  public static cancel() {
    if (this.isSupported()) {
      try {
        navigator.vibrate(0);
      } catch {
        // Ignore
      }
    }
  }
}
