import React, { useState, useEffect, useRef } from 'react';
import {
  DEMO_SCENARIOS,
  DemoScenario,
} from '../features/demo/DemoScenarios.js';
import { EnvironmentalEvent } from '@senseweave/shared';
import { EventCard } from '../features/live-session/EventCard.js';
import { BrailleDisplayBox } from '../components/accessibility/BrailleDisplayBox.js';
import { SpeakerStatusWidget } from '../features/live-session/SpeakerStatusWidget.js';
import { HapticPreviewModal } from '../components/accessibility/HapticPreviewModal.js';
import { HapticEngine } from '../lib/accessibility/hapticEngine.js';
import { AudioEngine } from '../lib/audio/audioEngine.js';
import { announceToScreenReader } from '../components/accessibility/LiveRegion.js';
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  Smartphone,
  Volume2,
  Terminal,
  Eye,
  Sliders,
  Sparkles,
  Info,
} from 'lucide-react';

export const DemoPage: React.FC = () => {
  const [selectedScenario, setSelectedScenario] = useState<DemoScenario>(DEMO_SCENARIOS[0]);
  const [currentEventIndex, setCurrentEventIndex] = useState<number>(-1);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [showHapticModal, setShowHapticModal] = useState<boolean>(false);

  // Active output modes in demo
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [hapticEnabled, setHapticEnabled] = useState(true);
  const [brailleEnabled, setBrailleEnabled] = useState(true);
  const [visualTimelineEnabled, setVisualTimelineEnabled] = useState(true);

  // Replay timeline
  const [processedEvents, setProcessedEvents] = useState<EnvironmentalEvent[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const currentEvent =
    currentEventIndex >= 0 && currentEventIndex < selectedScenario.events.length
      ? selectedScenario.events[currentEventIndex].event
      : null;

  const currentSpeaker = currentEvent?.speakerLabel || null;
  const isOverlapping = currentEvent?.eventType === 'overlapping_speech';
  const recentSpeakers = processedEvents
    .map((e) => e.speakerLabel)
    .filter((s): s is string => !!s);

  // Reset when scenario changes
  const handleScenarioChange = (scenario: DemoScenario) => {
    setIsPlaying(false);
    if (timerRef.current) clearTimeout(timerRef.current);
    setSelectedScenario(scenario);
    setCurrentEventIndex(-1);
    setProcessedEvents([]);
  };

  const executeEvent = (index: number) => {
    if (index >= selectedScenario.events.length) {
      setIsPlaying(false);
      return;
    }

    const { event } = selectedScenario.events[index];
    setCurrentEventIndex(index);
    setProcessedEvents((prev) => [event, ...prev]);

    // Sensory Outputs
    if (hapticEnabled) {
      if (event.priority === 'high' || event.eventType === 'overlapping_speech') {
        HapticEngine.trigger('rapid_pulse');
      } else if (event.eventType === 'speaker_turn') {
        HapticEngine.trigger('double_short');
      } else {
        HapticEngine.trigger('single_short');
      }
    }

    if (audioEnabled) {
      const pan = event.relativePosition.horizontal === 'left' ? -0.8 : event.relativePosition.horizontal === 'right' ? 0.8 : 0;
      AudioEngine.playEarcon(event.eventType === 'speaker_turn' ? 'turn' : 'alert', pan);
      AudioEngine.speak(event.description, { speechRate: 1.1 });
    }

    // Accessible Screen Reader Announcement
    announceToScreenReader(event.description, event.priority);
  };

  const handleNextStep = () => {
    const nextIdx = currentEventIndex + 1;
    if (nextIdx < selectedScenario.events.length) {
      executeEvent(nextIdx);
    }
  };

  const handleReset = () => {
    setIsPlaying(false);
    if (timerRef.current) clearTimeout(timerRef.current);
    setCurrentEventIndex(-1);
    setProcessedEvents([]);
    AudioEngine.stopAll();
  };

  // Playback timer loop
  useEffect(() => {
    if (!isPlaying) {
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }

    const nextIndex = currentEventIndex + 1;
    if (nextIndex >= selectedScenario.events.length) {
      setIsPlaying(false);
      return;
    }

    const delay = nextIndex === 0 ? 800 : 3500;
    timerRef.current = setTimeout(() => {
      executeEvent(nextIndex);
    }, delay);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isPlaying, currentEventIndex, selectedScenario]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-sense-950 text-sense-400 border border-sense-800 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Interactive Simulator</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white">
            Environmental Awareness Demo
          </h1>
          <p className="text-sm text-slate-400 max-w-2xl mt-1">
            Explore deterministic synthetic scenarios to experience how SenseWeave translates dynamic social and physical environments into personalized sensory feedback.
          </p>
        </div>

        {/* Sensory Modality Toggles */}
        <div
          role="group"
          aria-label="Active Sensory Feedback Modalities"
          className="bg-slate-900 border border-slate-800 p-2 rounded-2xl flex flex-wrap items-center gap-1.5 self-start"
        >
          <button
            onClick={() => setAudioEnabled(!audioEnabled)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-colors ${
              audioEnabled ? 'bg-sky-950 text-sky-300 border border-sky-800' : 'bg-slate-950 text-slate-400'
            }`}
            aria-pressed={audioEnabled}
          >
            <Volume2 className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Audio {audioEnabled ? 'On' : 'Off'}</span>
          </button>

          <button
            onClick={() => setHapticEnabled(!hapticEnabled)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-colors ${
              hapticEnabled ? 'bg-amber-950 text-amber-300 border border-amber-800' : 'bg-slate-950 text-slate-400'
            }`}
            aria-pressed={hapticEnabled}
          >
            <Smartphone className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Haptics {hapticEnabled ? 'On' : 'Off'}</span>
          </button>

          <button
            onClick={() => setBrailleEnabled(!brailleEnabled)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-colors ${
              brailleEnabled ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-slate-950 text-slate-400'
            }`}
            aria-pressed={brailleEnabled}
          >
            <Terminal className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Braille {brailleEnabled ? 'On' : 'Off'}</span>
          </button>

          <button
            onClick={() => setVisualTimelineEnabled(!visualTimelineEnabled)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-colors ${
              visualTimelineEnabled ? 'bg-purple-950 text-purple-300 border border-purple-800' : 'bg-slate-950 text-slate-400'
            }`}
            aria-pressed={visualTimelineEnabled}
          >
            <Eye className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Timeline {visualTimelineEnabled ? 'On' : 'Off'}</span>
          </button>
        </div>
      </div>

      {/* Scenario Selection Tabs */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Select Environmental Scenario:
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {DEMO_SCENARIOS.map((scen) => {
            const isSelected = selectedScenario.id === scen.id;
            return (
              <button
                key={scen.id}
                onClick={() => handleScenarioChange(scen)}
                className={`text-left p-4 rounded-2xl border transition-all ${
                  isSelected
                    ? 'bg-sense-950/70 border-sense-400 ring-2 ring-sense-500/30'
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                }`}
                aria-pressed={isSelected}
              >
                <span className="font-bold text-white text-base block mb-1">
                  {scen.title}
                </span>
                <p className="text-xs text-slate-400 line-clamp-2">
                  {scen.description}
                </p>
                <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="capitalize">{scen.environmentType.replace(/_/g, ' ')}</span>
                  <span>{scen.events.length} events</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Playback Controls & Status */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="px-4 py-2.5 rounded-xl bg-sense-600 hover:bg-sense-500 text-white font-bold text-sm flex items-center space-x-2 transition-all shadow-md shadow-sense-600/20"
            aria-label={isPlaying ? 'Pause scenario playback' : 'Play scenario simulation'}
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 fill-white" aria-hidden="true" />
            ) : (
              <Play className="w-4 h-4 fill-white" aria-hidden="true" />
            )}
            <span>{isPlaying ? 'Pause' : 'Play Simulation'}</span>
          </button>

          <button
            onClick={handleNextStep}
            disabled={isPlaying || currentEventIndex + 1 >= selectedScenario.events.length}
            className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 font-semibold text-sm flex items-center space-x-1.5"
            aria-label="Advance one event forward"
          >
            <SkipForward className="w-4 h-4" aria-hidden="true" />
            <span>Next Step</span>
          </button>

          <button
            onClick={handleReset}
            className="px-3 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 text-sm flex items-center space-x-1"
            aria-label="Reset simulation to beginning"
          >
            <RotateCcw className="w-4 h-4" aria-hidden="true" />
            <span>Reset</span>
          </button>
        </div>

        <div className="flex items-center space-x-4 text-xs text-slate-400">
          <button
            onClick={() => setShowHapticModal(true)}
            className="hover:text-sense-400 flex items-center space-x-1"
          >
            <Sliders className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Haptic Patterns Guide</span>
          </button>
          <span>
            Progress: {currentEventIndex + 1} / {selectedScenario.events.length}
          </span>
        </div>
      </div>

      {/* Main Demo Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Dynamics & Braille Output */}
        <div className="lg:col-span-1 space-y-6">
          <SpeakerStatusWidget
            currentSpeaker={currentSpeaker}
            isOverlapping={isOverlapping}
            recentSpeakers={recentSpeakers}
          />

          {brailleEnabled && (
            <BrailleDisplayBox
              brailleText={
                currentEvent
                  ? `[${currentEvent.eventType.toUpperCase()}] ${currentEvent.description}`
                  : '[IDLE] Press Play to begin simulated event timeline'
              }
              sourceModalities={currentEvent?.sourceModalities}
              observedAt={currentEvent?.observedAt}
              priority={currentEvent?.priority}
            />
          )}

          {/* Fictional Data Notice */}
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 space-y-1">
            <div className="flex items-center space-x-1.5 text-slate-300 font-semibold">
              <Info className="w-4 h-4 text-sense-400" aria-hidden="true" />
              <span>Simulated Scenario Notice</span>
            </div>
            <p>
              These events are synthetic deterministic demo observations designed to evaluate output sensory modes. No live camera or microphone tracks are active.
            </p>
          </div>
        </div>

        {/* Right Column: Timeline & Latest Event */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <span>Live Context Timeline</span>
              <span className="text-xs font-normal text-slate-400">
                ({processedEvents.length} events observed)
              </span>
            </h3>
          </div>

          {visualTimelineEnabled ? (
            <div className="space-y-3">
              {processedEvents.length > 0 ? (
                processedEvents.map((evt, idx) => (
                  <EventCard key={evt.id} event={evt} isLatest={idx === 0} />
                ))
              ) : (
                <div className="text-center py-16 bg-slate-900/40 border border-slate-800 rounded-2xl text-slate-400 space-y-2">
                  <Eye className="w-8 h-8 text-slate-400 mx-auto" aria-hidden="true" />
                  <p className="text-sm font-semibold text-slate-300">
                    Simulation Ready
                  </p>
                  <p className="text-xs max-w-sm mx-auto">
                    Click "Play Simulation" or "Next Step" to observe how the Live Context Weave Engine handles transitions, gestures, and announcements.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="p-6 bg-slate-900 rounded-2xl border border-slate-800 text-center text-slate-400 text-sm">
              Visual timeline disabled in Sensory Modalities. (Audio, Tactile, and Braille outputs remain active).
            </div>
          )}
        </div>
      </div>

      {showHapticModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <HapticPreviewModal onClose={() => setShowHapticModal(false)} />
        </div>
      )}
    </div>
  );
};
