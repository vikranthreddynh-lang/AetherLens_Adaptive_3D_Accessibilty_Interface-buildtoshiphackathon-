import React, { useState } from 'react';
import { Smartphone, Check, Play, Volume2, ShieldAlert } from 'lucide-react';
import { HAPTIC_PATTERNS } from '@senseweave/shared';
import { HapticEngine, HapticPatternName } from '../../lib/accessibility/hapticEngine.js';
import { AudioEngine } from '../../lib/audio/audioEngine.js';

interface HapticPreviewModalProps {
  onClose?: () => void;
}

export const HapticPreviewModal: React.FC<HapticPreviewModalProps> = ({ onClose }) => {
  const isVibrationSupported = HapticEngine.isSupported();
  const [activePattern, setActivePattern] = useState<string | null>(null);

  const patterns: Array<{
    key: HapticPatternName;
    title: string;
    description: string;
    ms: readonly number[];
  }> = [
    {
      key: 'single_short',
      title: 'Single Short Pulse',
      description: 'Used for new relevant environmental changes (e.g. raised hand, announcement start).',
      ms: HAPTIC_PATTERNS.single_short,
    },
    {
      key: 'double_short',
      title: 'Double Pulse',
      description: 'Used for conversational transitions (e.g. speaker turns).',
      ms: HAPTIC_PATTERNS.double_short,
    },
    {
      key: 'rapid_pulse',
      title: 'Rapid Pulsing',
      description: 'Used for multiple overlapping speech streams or interruptions.',
      ms: HAPTIC_PATTERNS.rapid_pulse,
    },
    {
      key: 'long_pulse',
      title: 'Long High-Priority Pulse',
      description: 'Used for user-configured critical notifications or emergency warnings.',
      ms: HAPTIC_PATTERNS.long_pulse,
    },
    {
      key: 'soft_alert',
      title: 'Soft Pulse',
      description: 'Used for ambient low-priority background updates.',
      ms: HAPTIC_PATTERNS.soft_alert,
    },
  ];

  const handleTest = (patternKey: HapticPatternName) => {
    setActivePattern(patternKey);
    HapticEngine.trigger(patternKey);
    // Also play audio earcon so users on desktop without vibration get clear auditory feedback
    AudioEngine.playEarcon('alert');

    setTimeout(() => {
      setActivePattern(null);
    }, 800);
  };

  return (
    <div
      role="dialog"
      aria-labelledby="haptic-modal-title"
      aria-modal="true"
      className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-xl w-full shadow-2xl space-y-5"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-tactile-amber/20 text-tactile-amber flex items-center justify-center">
            <Smartphone className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <h2 id="haptic-modal-title" className="text-lg font-bold text-white">
              Tactile Haptic Patterns Preview
            </h2>
            <p className="text-xs text-slate-400">
              SenseWeave encodes environmental cues into distinct physical vibration rhythms.
            </p>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-sm p-1.5 rounded-lg border border-slate-800"
          >
            Close
          </button>
        )}
      </div>

      {/* Device Capability Notice */}
      <div
        className={`p-3.5 rounded-xl border text-xs flex items-start space-x-3 ${
          isVibrationSupported
            ? 'bg-emerald-950/40 border-emerald-800 text-emerald-200'
            : 'bg-amber-950/40 border-amber-800 text-amber-200'
        }`}
      >
        {isVibrationSupported ? (
          <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" aria-hidden="true" />
        ) : (
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" aria-hidden="true" />
        )}
        <div>
          <span className="font-semibold block">
            {isVibrationSupported
              ? 'Vibration API Supported on this device'
              : 'Vibration API not detected on this device'}
          </span>
          <span className="text-slate-400 block mt-0.5">
            {isVibrationSupported
              ? 'Vibrations will be physically produced by the device motor. Note: phone vibration is not a directional array.'
              : 'Desktop browsers do not have vibration motors. SenseWeave activates simultaneous visual pulses and soft acoustic blips.'}
          </span>
        </div>
      </div>

      {/* Pattern Cards */}
      <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
        {patterns.map((p) => {
          const isPlaying = activePattern === p.key;
          return (
            <div
              key={p.key}
              className={`p-3.5 rounded-xl border transition-all flex items-center justify-between ${
                isPlaying
                  ? 'border-sense-400 bg-sense-950/60 shadow-lg shadow-sense-500/10'
                  : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
              }`}
            >
              <div className="space-y-1 pr-4">
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-white text-sm">{p.title}</span>
                  <span className="text-xs font-mono text-slate-400">
                    [{p.ms.join('ms, ')}ms]
                  </span>
                </div>
                <p className="text-xs text-slate-400">{p.description}</p>
              </div>

              <button
                onClick={() => handleTest(p.key)}
                className={`px-3 py-2 rounded-lg font-semibold text-xs flex items-center space-x-1.5 transition-all ${
                  isPlaying
                    ? 'bg-sense-500 text-white animate-pulse'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                }`}
                aria-label={`Test pattern: ${p.title}`}
              >
                {isPlaying ? (
                  <Volume2 className="w-3.5 h-3.5" aria-hidden="true" />
                ) : (
                  <Play className="w-3.5 h-3.5" aria-hidden="true" />
                )}
                <span>{isPlaying ? 'Pulsing...' : 'Test'}</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
