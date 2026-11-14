import { useState, useEffect, useCallback } from 'react';
import {
  AccessibilityPreferences,
  DEFAULT_ACCESSIBILITY_PREFERENCES,
} from '@senseweave/shared';
import { apiClient } from '../lib/api/client.js';
import { useAuth } from './useAuth.js';

const STORAGE_KEY = 'senseweave_accessibility_preferences';

export function useAccessibilityPreferences() {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<AccessibilityPreferences>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // Ignore
        }
      }
    }
    return DEFAULT_ACCESSIBILITY_PREFERENCES;
  });

  const [isSyncing, setIsSyncing] = useState(false);

  // Sync from user profile when signed in
  useEffect(() => {
    if (!user) return;
    apiClient.getProfile().then((profileData: unknown) => {
      const p = profileData as { accessibilityPreferences?: AccessibilityPreferences } | null;
      if (p?.accessibilityPreferences) {
        setPreferences(p.accessibilityPreferences);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(p.accessibilityPreferences));
      }
    }).catch(() => {});
  }, [user]);

  const updatePreferences = useCallback(
    async (newPrefs: Partial<AccessibilityPreferences>) => {
      setPreferences((prev) => {
        const merged: AccessibilityPreferences = {
          ...prev,
          ...newPrefs,
          outputs: {
            ...prev.outputs,
            ...(newPrefs.outputs || {}),
          },
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));

        if (user) {
          setIsSyncing(true);
          apiClient
            .updateProfile({ accessibilityPreferences: merged, preferredLanguage: 'en' })
            .catch(() => {})
            .finally(() => setIsSyncing(false));
        }

        return merged;
      });
    },
    [user]
  );

  const toggleOutput = useCallback(
    (mode: keyof AccessibilityPreferences['outputs']) => {
      setPreferences((prev) => {
        const nextVal = !prev.outputs[mode];
        const nextOutputs = { ...prev.outputs, [mode]: nextVal };
        const updated = { ...prev, outputs: nextOutputs };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

        if (user) {
          apiClient.updateProfile({ accessibilityPreferences: updated, preferredLanguage: 'en' }).catch(() => {});
        }
        return updated;
      });
    },
    [user]
  );

  return {
    preferences,
    updatePreferences,
    toggleOutput,
    isSyncing,
  };
}
