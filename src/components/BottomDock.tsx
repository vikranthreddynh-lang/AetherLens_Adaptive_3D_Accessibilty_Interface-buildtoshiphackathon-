import React, { useState } from 'react';
import { Mic, Eye, Volume2, Info, Lock } from 'lucide-react';
import { FeatureId, LanguageCode } from '../types/accessibility';
import { FEATURES, UI_STRINGS } from '../data/demoScenario';

interface BottomDockProps {
  activeFeature: FeatureId | null;
  onFeatureSelect: (feature: FeatureId | null) => void;
  onVoiceTrigger: () => void;
  onSimplifyTrigger: () => void;
  simplifyActive: boolean;
  language: LanguageCode;
}

export const BottomDock: React.FC<BottomDockProps> = ({
  activeFeature,
  onFeatureSelect,
  onVoiceTrigger,
  onSimplifyTrigger,
  simplifyActive,
  language,
}) => {
  const strings = UI_STRINGS[language] || UI_STRINGS.en;
  const [isHolding, setIsHolding] = useState(false);
  const [toggleVoiceLock, setToggleVoiceLock] = useState(false);

  const isVoiceActive = isHolding || toggleVoiceLock;

  const startHold = () => {
    setIsHolding(true);
    onVoiceTrigger();
  };

  const endHold = () => {
    setIsHolding(false);
  };

  const toggleLockVoice = () => {
    const next = !toggleVoiceLock;
    setToggleVoiceLock(next);
    if (next) {
      onVoiceTrigger();
    }
  };

  return (
    <footer
      role="region"
      aria-label="Assistive Action Dock"
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30 w-[95%] max-w-3xl pointer-events-none"
    >
      <div className="pointer-events-auto bg-aether-bg/95 backdrop-blur-md border border-aether-line/80 rounded-2xl p-2.5 shadow-aether-subtle flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Mobile/Compact Node Quick Access */}
        <div className="flex lg:hidden items-center gap-1 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          {FEATURES.map((feature) => {
            const isSelected = activeFeature === feature.id;
            return (
              <button
                key={feature.id}
                type="button"
                onClick={() => onFeatureSelect(isSelected ? null : feature.id)}
                aria-pressed={isSelected}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap border transition-all focus:outline-none focus:ring-2 focus:ring-aether-deep ${
                  isSelected
                    ? 'bg-aether-deep text-aether-bg border-aether-deep'
                    : 'bg-aether-bg text-aether-deep border-aether-line/50 hover:border-aether-glow'
                }`}
              >
                {feature.title}
              </button>
            );
          })}
        </div>

        {/* Live Audio / Voice Feedback Indicator (Visual Simulated Stream) */}
        {isVoiceActive && (
          <div
            role="status"
            aria-live="polite"
            className="flex items-center gap-2 px-3 py-1 rounded-full bg-aether-deep text-aether-bg text-xs font-medium animate-pulse"
          >
            <Volume2 className="w-3.5 h-3.5 text-aether-glow" />
            <span>{strings.listeningSimulated}</span>
            <span className="flex gap-0.5">
              <span className="w-1 h-3 bg-aether-glow rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1 h-4 bg-aether-glow rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1 h-2 bg-aether-glow rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </span>
          </div>
        )}

        {/* Primary Assistive Action Buttons */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          {/* Hold to Speak Button in #3D52A0 with Accessible Non-Hold Toggle */}
          <div className="relative inline-flex items-center rounded-xl bg-aether-deep p-0.5 shadow-sm">
            <button
              type="button"
              onPointerDown={startHold}
              onPointerUp={endHold}
              onPointerLeave={endHold}
              onKeyDown={(e) => {
                if (e.key === ' ' || e.key === 'Enter') {
                  e.preventDefault();
                  startHold();
                }
              }}
              onKeyUp={(e) => {
                if (e.key === ' ' || e.key === 'Enter') {
                  e.preventDefault();
                  endHold();
                }
              }}
              aria-label={`${strings.holdToSpeak}. Hold or spacebar to speak (demo visual)`}
              aria-pressed={isHolding}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-l-lg text-xs font-bold text-aether-bg transition-all select-none focus:outline-none focus:ring-2 focus:ring-aether-glow ${
                isHolding ? 'bg-aether-deep ring-2 ring-aether-glow' : 'hover:bg-aether-deep/90'
              }`}
            >
              <Mic className={`w-4 h-4 ${isVoiceActive ? 'text-aether-glow animate-pulse' : 'text-aether-bg'}`} />
              <span>{strings.holdToSpeak}</span>
            </button>

            {/* Accessible Click Toggle alternative for motor limitations */}
            <button
              type="button"
              onClick={toggleLockVoice}
              aria-label={`Toggle continuous voice simulation mode (Current: ${toggleVoiceLock ? 'Locked On' : 'Off'})`}
              title="Click toggle for hands-free listening demo"
              className={`p-2 rounded-r-lg border-l border-aether-line/40 text-aether-bg text-xs focus:outline-none focus:ring-2 focus:ring-aether-glow transition-colors ${
                toggleVoiceLock ? 'bg-aether-glow text-aether-deep' : 'hover:bg-aether-deep/80'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Simplify View Toggle Button in #7091E6 */}
          <button
            type="button"
            onClick={onSimplifyTrigger}
            aria-pressed={simplifyActive}
            aria-label={`${strings.simplifyView}: ${simplifyActive ? 'Active' : 'Inactive'}`}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all focus:outline-none focus:ring-2 focus:ring-aether-deep ${
              simplifyActive
                ? 'bg-aether-glow text-aether-deep shadow-aether-glow border-2 border-aether-deep'
                : 'bg-aether-glow text-aether-deep hover:bg-aether-glow/90 border border-aether-deep/40'
            }`}
          >
            <Eye className="w-4 h-4 text-aether-deep" />
            <span>{strings.simplifyView}</span>
            <span
              className={`w-2 h-2 rounded-full ${
                simplifyActive ? 'bg-aether-deep' : 'bg-aether-bg'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Visually unobtrusive hint */}
      <div className="flex items-center justify-center gap-1.5 mt-1.5 text-[10px] text-aether-deep/75 select-none text-center">
        <Info className="w-3 h-3 text-aether-line" />
        <span>Sample UI interaction shell. No audio or user data leaves your browser.</span>
      </div>
    </footer>
  );
};
