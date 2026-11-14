import React, { useState } from 'react';
import {
  Sliders,
  Volume2,
  Smartphone,
  Terminal,
  Eye,
  Compass,
  Check,
  RotateCcw,
} from 'lucide-react';
import { useAccessibilityPreferences } from '../hooks/useAccessibilityPreferences.js';
import { HapticEngine } from '../lib/accessibility/hapticEngine.js';
import { AudioEngine } from '../lib/audio/audioEngine.js';

export const AccessibilitySettingsPage: React.FC = () => {
  const { preferences, updatePreferences, toggleOutput, isSyncing } = useAccessibilityPreferences();
  const [savedNotice, setSavedNotice] = useState(false);

  const handleTestAudio = () => {
    AudioEngine.speak('SenseWeave voice calibration active.', {
      speechRate: preferences.speechRate,
    });
  };

  const handleTestHaptics = () => {
    HapticEngine.trigger('double_short');
  };

  const handleTestSpatial = () => {
    AudioEngine.runHeadphoneTest();
  };

  const handleSave = () => {
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2000);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <div className="flex items-center space-x-2 text-sense-400 text-xs font-bold uppercase tracking-wider mb-1">
          <Sliders className="w-4 h-4" aria-hidden="true" />
          <span>Sensory Preferences</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white">
          Accessibility Settings
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Control how physical and social signals are translated into sensory feedback.
        </p>
      </div>

      {savedNotice && (
        <div
          role="status"
          className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-200 text-xs font-semibold flex items-center space-x-2"
        >
          <Check className="w-4 h-4 text-emerald-400" aria-hidden="true" />
          <span>Preferences updated and saved successfully.</span>
        </div>
      )}

      {/* Output Channels */}
      <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <h2 className="text-base font-bold text-white">Sensory Output Channels</h2>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <div>
              <span className="font-semibold text-white text-sm block">Accessible Text</span>
              <span className="text-xs text-slate-400">Semantic text announcements for screen readers</span>
            </div>
            <input
              type="checkbox"
              checked={preferences.outputs.accessibleText}
              onChange={() => toggleOutput('accessibleText')}
              className="w-5 h-5 accent-sense-500 rounded"
              aria-label="Toggle Accessible Text"
            />
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <div>
              <span className="font-semibold text-white text-sm block">Spoken Audio Descriptions</span>
              <span className="text-xs text-slate-400">Concise voice announcements of observable changes</span>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleTestAudio}
                className="text-xs text-sense-400 hover:text-sense-300 font-semibold"
              >
                Test Voice
              </button>
              <input
                type="checkbox"
                checked={preferences.outputs.audio}
                onChange={() => toggleOutput('audio')}
                className="w-5 h-5 accent-sense-500 rounded"
                aria-label="Toggle Spoken Audio"
              />
            </div>
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <div>
              <span className="font-semibold text-white text-sm block">Tactile Vibration</span>
              <span className="text-xs text-slate-400">Configurable haptic rhythms for physical notifications</span>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleTestHaptics}
                className="text-xs text-sense-400 hover:text-sense-300 font-semibold"
              >
                Pulse Hand
              </button>
              <input
                type="checkbox"
                checked={preferences.outputs.haptics}
                onChange={() => toggleOutput('haptics')}
                className="w-5 h-5 accent-sense-500 rounded"
                aria-label="Toggle Tactile Vibration"
              />
            </div>
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <div>
              <span className="font-semibold text-white text-sm block">Refreshable Braille Output</span>
              <span className="text-xs text-slate-400">Bracketed tokenized descriptions formatted for Braille displays</span>
            </div>
            <input
              type="checkbox"
              checked={preferences.outputs.brailleCompatible}
              onChange={() => toggleOutput('brailleCompatible')}
              className="w-5 h-5 accent-sense-500 rounded"
              aria-label="Toggle Refreshable Braille"
            />
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <div>
              <span className="font-semibold text-white text-sm block">Stereo Spatial Audio</span>
              <span className="text-xs text-slate-400">Directional audio panning when relative position is observed</span>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleTestSpatial}
                className="text-xs text-sense-400 hover:text-sense-300 font-semibold"
              >
                Stereo Test
              </button>
              <input
                type="checkbox"
                checked={preferences.outputs.spatialAudio}
                onChange={() => toggleOutput('spatialAudio')}
                className="w-5 h-5 accent-sense-500 rounded"
                aria-label="Toggle Spatial Audio"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Speed & Quiet Mode */}
      <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
        <h2 className="text-base font-bold text-white">Speech & Density Tuning</h2>

        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm font-semibold text-white">
            <label htmlFor="rate-slider">Speaking Speed: {preferences.speechRate.toFixed(1)}x</label>
            <button
              onClick={handleTestAudio}
              className="text-xs text-sense-400 hover:text-sense-300"
            >
              Play Preview
            </button>
          </div>
          <input
            id="rate-slider"
            type="range"
            min="0.7"
            max="2.0"
            step="0.1"
            value={preferences.speechRate}
            onChange={(e) => updatePreferences({ speechRate: parseFloat(e.target.value) })}
            className="w-full accent-sense-500"
          />
        </div>

        <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
          <div>
            <span className="font-semibold text-white text-sm block">Quiet Mode</span>
            <span className="text-xs text-slate-400">
              Silences subtle background blips; triggers only on high-priority warnings
            </span>
          </div>
          <input
            type="checkbox"
            checked={preferences.quietMode}
            onChange={(e) => updatePreferences({ quietMode: e.target.checked })}
            className="w-5 h-5 accent-sense-500 rounded"
            aria-label="Toggle Quiet Mode"
          />
        </div>
      </section>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="px-6 py-3 rounded-xl bg-sense-600 hover:bg-sense-500 text-white font-bold text-sm shadow-md shadow-sense-600/20"
        >
          {isSyncing ? 'Saving to Profile...' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
};
