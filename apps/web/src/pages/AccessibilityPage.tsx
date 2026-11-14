import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sliders,
  Terminal,
  Smartphone,
  Volume2,
  Keyboard,
  CheckCircle2,
  SlidersHorizontal,
} from 'lucide-react';
import { HapticPreviewModal } from '../components/accessibility/HapticPreviewModal.js';
import { AudioEngine } from '../lib/audio/audioEngine.js';

export const AccessibilityPage: React.FC = () => {
  const [showHaptics, setShowHaptics] = useState(false);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="space-y-3 text-center">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-sense-950 text-sense-400 border border-sense-800 text-xs font-semibold">
          <Sliders className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Inclusion Standards</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
          Accessibility & Sensory Calibration Guide
        </h1>
        <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto">
          SenseWeave is designed specifically for DeafBlind, blind, and low-vision individuals. We provide full sensory sovereignty without requiring medical disclosures.
        </p>
      </div>

      {/* Sensory Output Options */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-white flex items-center space-x-2">
          <SlidersHorizontal className="w-5 h-5 text-sense-400" aria-hidden="true" />
          <span>Configurable Sensory Channels</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-base flex items-center space-x-2">
                <Smartphone className="w-4 h-4 text-tactile-amber" aria-hidden="true" />
                <span>Tactile Haptics</span>
              </h3>
              <button
                onClick={() => setShowHaptics(true)}
                className="text-xs text-sense-400 hover:text-sense-300 font-semibold"
              >
                Preview Patterns
              </button>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Configurable vibration pulses encode new events, conversational turns, and priority notices directly to your hand. Works with the Web Vibration API.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-2.5">
            <h3 className="font-bold text-white text-base flex items-center space-x-2">
              <Terminal className="w-4 h-4 text-emerald-400" aria-hidden="true" />
              <span>Refreshable Braille Output</span>
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Tokenized concise messages (e.g. <code>[TURN: Spk B]</code>) rendered through accessible live regions and terminal buffers formatted for 40-cell and 80-cell Braille displays.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-base flex items-center space-x-2">
                <Volume2 className="w-4 h-4 text-sky-400" aria-hidden="true" />
                <span>Spoken Audio & Spatial Cues</span>
              </h3>
              <button
                onClick={() => AudioEngine.runHeadphoneTest()}
                className="text-xs text-sense-400 hover:text-sense-300 font-semibold"
              >
                Test Headphones
              </button>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Concise speech synthesis with adjustable speed and optional stereo audio panning when relative direction is observed.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-2.5">
            <h3 className="font-bold text-white text-base flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-purple-400" aria-hidden="true" />
              <span>Quiet Mode & Filter Control</span>
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Filter out ambient non-essential updates and receive cues only when high-priority announcements, speaker overlaps, or significant physical gestures occur.
            </p>
          </div>
        </div>
      </div>

      {/* Screen Reader & Keyboard Shortcuts */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center space-x-2">
          <Keyboard className="w-5 h-5 text-sense-400" aria-hidden="true" />
          <span>Screen Reader & Keyboard Shortcuts</span>
        </h2>

        <p className="text-xs text-slate-300">
          SenseWeave conforms to WCAG 2.1 AAA semantic HTML guidelines. All interactive controls are keyboard reachable with high-contrast 4px focus rings.
        </p>

        <div className="overflow-x-auto pt-2">
          <table className="w-full text-left text-xs text-slate-300 border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[11px]">
                <th className="py-2.5 px-3">Shortcut / Target</th>
                <th className="py-2.5 px-3">Function</th>
                <th className="py-2.5 px-3">ARIA Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              <tr>
                <td className="py-2.5 px-3 font-semibold text-white">Tab / Shift+Tab</td>
                <td className="py-2.5 px-3 font-sans">Navigate between interactive controls and buttons</td>
                <td className="py-2.5 px-3">standard focusable</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-semibold text-white">Spacebar / Enter</td>
                <td className="py-2.5 px-3 font-sans">Toggle pause, mute camera, or activate sensory previews</td>
                <td className="py-2.5 px-3">button / switch</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-semibold text-white">Live Status Announcer</td>
                <td className="py-2.5 px-3 font-sans">Speaks verified cues without stealing keyboard focus</td>
                <td className="py-2.5 px-3 text-emerald-400">role="status" aria-live="polite"</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-semibold text-white">High-Priority Alert</td>
                <td className="py-2.5 px-3 font-sans">Immediately announces overlapping speech or emergency PA</td>
                <td className="py-2.5 px-3 text-rose-400">role="alert" aria-live="assertive"</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="text-center pt-2">
        <Link
          to="/onboarding"
          className="px-6 py-3.5 rounded-xl bg-sense-600 hover:bg-sense-500 text-white font-bold text-sm inline-flex items-center space-x-2"
        >
          <span>Configure Your Sensory Profile</span>
        </Link>
      </div>

      {showHaptics && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <HapticPreviewModal onClose={() => setShowHaptics(false)} />
        </div>
      )}
    </div>
  );
};
