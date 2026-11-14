import { useState, useEffect, useCallback } from 'react';
import { useReducedMotion } from './useReducedMotion';

export interface CalmModeState {
  isCalmMode: boolean;
  systemPrefersReducedMotion: boolean;
  motionBlockedBySystem: boolean;
  announcement: string;
  toggleCalmMode: () => void;
  setCalmMode: (value: boolean) => void;
}

export function useCalmMode(): CalmModeState {
  const systemPrefersReducedMotion = useReducedMotion();
  const [manualCalmOverride, setManualCalmOverride] = useState<boolean | null>(null);
  const [announcement, setAnnouncement] = useState<string>('');

  // Effective calm mode: user manual choice if set, otherwise system preference
  const isCalmMode = manualCalmOverride !== null ? manualCalmOverride : systemPrefersReducedMotion;

  // Track if motion is blocked because system preference forces reduced motion
  const motionBlockedBySystem = !isCalmMode && systemPrefersReducedMotion;

  // On initial mount or when system preference changes, announce if system forced it
  useEffect(() => {
    if (systemPrefersReducedMotion && manualCalmOverride === null) {
      setAnnouncement('Calm Mode enabled automatically based on system reduced-motion preference.');
    }
  }, [systemPrefersReducedMotion, manualCalmOverride]);

  const toggleCalmMode = useCallback(() => {
    setManualCalmOverride((prev) => {
      const current = prev !== null ? prev : systemPrefersReducedMotion;
      const next = !current;
      if (next) {
        setAnnouncement('Calm Mode enabled. 3D motion paused. High-contrast static view enabled.');
      } else {
        if (systemPrefersReducedMotion) {
          setAnnouncement('Calm Mode toggled off, but 3D animations remain paused because system reduced-motion is active.');
        } else {
          setAnnouncement('Calm Mode disabled. 3D scene motion and spatial transitions resumed.');
        }
      }
      return next;
    });
  }, [systemPrefersReducedMotion]);

  const setCalmMode = useCallback((value: boolean) => {
    setManualCalmOverride(value);
    if (value) {
      setAnnouncement('Calm Mode enabled.');
    } else {
      setAnnouncement(
        systemPrefersReducedMotion
          ? 'Calm Mode disabled, but motion remains paused due to system preference.'
          : 'Calm Mode disabled.'
      );
    }
  }, [systemPrefersReducedMotion]);

  return {
    isCalmMode,
    systemPrefersReducedMotion,
    motionBlockedBySystem,
    announcement,
    toggleCalmMode,
    setCalmMode,
  };
}
