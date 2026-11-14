import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sliders,
  Smartphone,
  Volume2,
  Terminal,
  Eye,
  Compass,
  Check,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { useAccessibilityPreferences } from '../hooks/useAccessibilityPreferences.js';
import { HapticEngine } from '../lib/accessibility/hapticEngine.js';
import { AudioEngine } from '../lib/audio/audioEngine.js';

export const OnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const { preferences, updatePreferences } = useAccessibilityPreferences();

  // Local state for wizard steps
  const [step, setStep] = useState(1);
  const [outputs, setOutputs] = useState(preferences.outputs);
  const [detailLevel, setDetailLevel] = useState(preferences.detailLevel);
  const [quietMode, setQuietMode] = useState(preferences.quietMode);
  const [speechRate, setSpeechRate] = useState(preferences.speechRate);
  const [hapticVocab, setHapticVocab] = useState(preferences.hapticVocabulary);

  const toggleOutput = (key: keyof typeof outputs) => {
    setOutputs((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleTestAudio = () => {
    AudioEngine.speak('SenseWeave audio output is calibrated and active.', { speechRate });
  };

  const handleTestHaptics = () => {
    HapticEngine.trigger('double_short');
  };

  const handleTestSpatial = () => {
    AudioEngine.runHeadphoneTest();
  };

  const handleComplete = async () => {
    await updatePreferences({
      outputs,
      detailLevel,
      quietMode,
      speechRate,
      hapticVocabulary: hapticVocab,
    });
    navigate('/session/new');
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 space-y-8">
      {/* Step Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-sense-950 text-sense-400 border border-sense-800 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Step {step} of 3</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white">
          {step === 1 && 'Choose Your Sensory Feedback Channels'}
          {step === 2 && 'Calibrate Output Density & Speed'}
          {step === 3 && 'Preview & Confirm Preferences'}
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          We never ask for disability disclosures. Select the feedback modes you prefer.
        </p>
      </div>

      {/* Step 1: Channels */}
      {step === 1 && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <button
              type="button"
              onClick={() => toggleOutput('accessibleText')}
              className={`p-4 rounded-2xl border text-left flex items-start space-x-3 transition-all ${
                outputs.accessibleText
                  ? 'bg-sense-950/60 border-sense-400 ring-2 ring-sense-500/20'
                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
              }`}
              aria-pressed={outputs.accessibleText}
            >
              <div className={`p-2 rounded-xl mt-0.5 ${outputs.accessibleText ? 'bg-sense-500 text-white' : 'bg-slate-800 text-slate-400'}`}>
                <Check className="w-4 h-4" aria-hidden="true" />
              </div>
              <div>
                <span className="font-bold text-white text-sm block">Accessible Text</span>
                <span className="text-xs text-slate-400">Screen-reader readable descriptions</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => toggleOutput('audio')}
              className={`p-4 rounded-2xl border text-left flex items-start space-x-3 transition-all ${
                outputs.audio
                  ? 'bg-sense-950/60 border-sense-400 ring-2 ring-sense-500/20'
                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
              }`}
              aria-pressed={outputs.audio}
            >
              <div className={`p-2 rounded-xl mt-0.5 ${outputs.audio ? 'bg-sense-500 text-white' : 'bg-slate-800 text-slate-400'}`}>
                <Volume2 className="w-4 h-4" aria-hidden="true" />
              </div>
              <div>
                <span className="font-bold text-white text-sm block">Spoken Audio</span>
                <span className="text-xs text-slate-400">Natural voice environmental summaries</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => toggleOutput('haptics')}
              className={`p-4 rounded-2xl border text-left flex items-start space-x-3 transition-all ${
                outputs.haptics
                  ? 'bg-sense-950/60 border-sense-400 ring-2 ring-sense-500/20'
                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
              }`}
              aria-pressed={outputs.haptics}
            >
              <div className={`p-2 rounded-xl mt-0.5 ${outputs.haptics ? 'bg-sense-500 text-white' : 'bg-slate-800 text-slate-400'}`}>
                <Smartphone className="w-4 h-4" aria-hidden="true" />
              </div>
              <div>
                <span className="font-bold text-white text-sm block">Tactile Haptics</span>
                <span className="text-xs text-slate-400">Vibration patterns for transitions</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => toggleOutput('brailleCompatible')}
              className={`p-4 rounded-2xl border text-left flex items-start space-x-3 transition-all ${
                outputs.brailleCompatible
                  ? 'bg-sense-950/60 border-sense-400 ring-2 ring-sense-500/20'
                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
              }`}
              aria-pressed={outputs.brailleCompatible}
            >
              <div className={`p-2 rounded-xl mt-0.5 ${outputs.brailleCompatible ? 'bg-sense-500 text-white' : 'bg-slate-800 text-slate-400'}`}>
                <Terminal className="w-4 h-4" aria-hidden="true" />
              </div>
              <div>
                <span className="font-bold text-white text-sm block">Braille Terminal</span>
                <span className="text-xs text-slate-400">Low-clutter bracketed pin tokens</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => toggleOutput('visualTimeline')}
              className={`p-4 rounded-2xl border text-left flex items-start space-x-3 transition-all ${
                outputs.visualTimeline
                  ? 'bg-sense-950/60 border-sense-400 ring-2 ring-sense-500/20'
                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
              }`}
              aria-pressed={outputs.visualTimeline}
            >
              <div className={`p-2 rounded-xl mt-0.5 ${outputs.visualTimeline ? 'bg-sense-500 text-white' : 'bg-slate-800 text-slate-400'}`}>
                <Eye className="w-4 h-4" aria-hidden="true" />
              </div>
              <div>
                <span className="font-bold text-white text-sm block">Visual Timeline</span>
                <span className="text-xs text-slate-400">High-contrast chronological stream</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => toggleOutput('spatialAudio')}
              className={`p-4 rounded-2xl border text-left flex items-start space-x-3 transition-all ${
                outputs.spatialAudio
                  ? 'bg-sense-950/60 border-sense-400 ring-2 ring-sense-500/20'
                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
              }`}
              aria-pressed={outputs.spatialAudio}
            >
              <div className={`p-2 rounded-xl mt-0.5 ${outputs.spatialAudio ? 'bg-sense-500 text-white' : 'bg-slate-800 text-slate-400'}`}>
                <Compass className="w-4 h-4" aria-hidden="true" />
              </div>
              <div>
                <span className="font-bold text-white text-sm block">Stereo Spatial Audio</span>
                <span className="text-xs text-slate-400">Relative left-to-right acoustic panning</span>
              </div>
            </button>
          </div>

          <div className="flex justify-end pt-4">
            <button
              onClick={() => setStep(2)}
              className="px-6 py-3 rounded-xl bg-sense-600 hover:bg-sense-500 text-white font-bold text-sm flex items-center space-x-2"
            >
              <span>Continue to Calibration</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Density & Tuning */}
      {step === 2 && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
          {/* Detail Level */}
          <div className="space-y-3">
            <label className="text-sm font-bold text-white block">
              Information Density Level:
            </label>
            <div className="grid grid-cols-3 gap-3">
              {(['low', 'balanced', 'high'] as const).map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setDetailLevel(lvl)}
                  className={`p-3 rounded-xl border text-center font-semibold text-xs sm:text-sm capitalize transition-all ${
                    detailLevel === lvl
                      ? 'bg-sense-950 border-sense-400 text-white'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
            <p className="text-xs text-slate-400">
              {detailLevel === 'low' && 'Only major transitions, hand raises, and emergency announcements.'}
              {detailLevel === 'balanced' && 'Speaker changes, observable gestures, and environmental changes.'}
              {detailLevel === 'high' && 'Comprehensive stream of every observable motion and speech turn.'}
            </p>
          </div>

          {/* Speech Rate Slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <label htmlFor="speech-rate-slider" className="font-bold text-white">
                Speaking Speed: {speechRate.toFixed(1)}x
              </label>
              <button
                type="button"
                onClick={handleTestAudio}
                className="text-xs text-sense-400 hover:text-sense-300 font-semibold"
              >
                Test Voice Speed
              </button>
            </div>
            <input
              id="speech-rate-slider"
              type="range"
              min="0.7"
              max="2.0"
              step="0.1"
              value={speechRate}
              onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
              className="w-full accent-sense-500"
            />
          </div>

          {/* Quiet Mode */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-950/60 border border-slate-800">
            <div>
              <span className="font-bold text-white text-sm block">Quiet Mode</span>
              <span className="text-xs text-slate-400">Mutes ambient updates; triggers only for high-priority alerts</span>
            </div>
            <input
              type="checkbox"
              checked={quietMode}
              onChange={(e) => setQuietMode(e.target.checked)}
              className="w-5 h-5 accent-sense-500 rounded"
              aria-label="Toggle Quiet Mode"
            />
          </div>

          <div className="flex justify-between pt-4">
            <button
              onClick={() => setStep(1)}
              className="px-5 py-2.5 rounded-xl text-slate-300 hover:text-white bg-slate-800 text-sm font-semibold"
            >
              Back
            </button>
            <button
              onClick={() => setStep(3)}
              className="px-6 py-3 rounded-xl bg-sense-600 hover:bg-sense-500 text-white font-bold text-sm flex items-center space-x-2"
            >
              <span>Continue to Preview</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Interactive Preview & Confirm */}
      {step === 3 && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="space-y-3">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider text-slate-400">
              Interactive Channel Verification
            </h2>

            <div className="space-y-2.5">
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-white text-sm block">Tactile Vibration</span>
                  <span className="text-xs text-slate-400">Test double pulse transition rhythm</span>
                </div>
                <button
                  onClick={handleTestHaptics}
                  className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
                >
                  Pulse Hand
                </button>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-white text-sm block">Speech Output</span>
                  <span className="text-xs text-slate-400">Speech at {speechRate.toFixed(1)}x speed</span>
                </div>
                <button
                  onClick={handleTestAudio}
                  className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
                >
                  Play Voice
                </button>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-white text-sm block">Spatial Headphone Test</span>
                  <span className="text-xs text-slate-400">Verifies stereo separation (Left &gt; Center &gt; Right)</span>
                </div>
                <button
                  onClick={handleTestSpatial}
                  className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
                >
                  Play Stereo
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <button
              onClick={() => setStep(2)}
              className="px-5 py-2.5 rounded-xl text-slate-300 hover:text-white bg-slate-800 text-sm font-semibold"
            >
              Back
            </button>
            <button
              onClick={handleComplete}
              className="px-6 py-3 rounded-xl bg-sense-600 hover:bg-sense-500 text-white font-bold text-sm flex items-center space-x-2 shadow-lg shadow-sense-600/25"
            >
              <Check className="w-4 h-4" aria-hidden="true" />
              <span>Confirm & Start Session</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
