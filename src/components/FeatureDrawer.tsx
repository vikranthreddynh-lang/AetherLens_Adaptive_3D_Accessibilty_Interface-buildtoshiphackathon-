import React, { useEffect, useRef } from 'react';
import { X, Sparkles, MessageSquare, Volume2, Shield } from 'lucide-react';
import { FeatureDrawerProps, LanguageCode } from '../types/accessibility';
import { FEATURES, UI_STRINGS } from '../data/demoScenario';
import { WhatIfDemo } from './WhatIfDemo';

interface ExtendedFeatureDrawerProps extends FeatureDrawerProps {
  language: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
  simplifyActive: boolean;
}

export const FeatureDrawer: React.FC<ExtendedFeatureDrawerProps> = ({
  feature,
  onClose,
  onVoiceTrigger,
  onSimplifyTrigger,
  language,
  onLanguageChange,
  simplifyActive,
}) => {
  const strings = UI_STRINGS[language] || UI_STRINGS.en;
  const drawerRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const featureMeta = FEATURES.find((f) => f.id === feature) || FEATURES[0];

  // Focus management: focus close button when drawer opens
  useEffect(() => {
    if (closeButtonRef.current) {
      closeButtonRef.current.focus();
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [feature, onClose]);

  /**
   * INTEGRATION SLOTS:
   * 1. onVoiceTrigger: Can dispatch audio stream start/stop to speech transcription worker.
   * 2. onSimplifyTrigger: Can request LLM plain-language rewrite for the active feature.
   */

  return (
    <aside
      ref={drawerRef}
      role="dialog"
      aria-modal="false"
      aria-label={`${featureMeta.title} Configuration and Pathway Panel`}
      className="fixed inset-y-0 right-0 z-40 w-full sm:w-[480px] lg:w-[520px] max-w-full flex flex-col bg-aether-bg/95 backdrop-blur-xl border-l border-aether-line shadow-2xl transition-transform duration-300"
    >
      {/* Drawer Header */}
      <div className="p-4 md:p-6 border-b border-aether-line/40 flex items-start justify-between gap-4 bg-aether-bg">
        <div className="flex-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono tracking-widest uppercase bg-aether-soft/30 text-aether-deep border border-aether-line/60 mb-2">
            <Sparkles className="w-3 h-3 text-aether-glow" />
            <span>{featureMeta.badge}</span>
          </div>
          <h2 className="text-lg md:text-xl font-bold text-aether-deep tracking-tight">
            {featureMeta.title}
          </h2>
          <p className="text-xs text-aether-deep/75 mt-0.5">
            {featureMeta.subtitle}
          </p>
        </div>

        {/* Accessible Close Button */}
        <button
          ref={closeButtonRef}
          type="button"
          onClick={onClose}
          aria-label={strings.closeDrawer}
          className="p-2 rounded-xl text-aether-deep hover:bg-aether-soft/30 border border-aether-line/50 hover:border-aether-deep focus:outline-none focus:ring-2 focus:ring-aether-deep transition-colors"
        >
          <X className="w-5 h-5 text-aether-deep" />
        </button>
      </div>

      {/* Drawer Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
        {feature === 'what-if-pathways' && (
          <WhatIfDemo
            language={language}
            onLanguageChange={onLanguageChange}
            simplifyActive={simplifyActive}
            onVoiceTrigger={onVoiceTrigger}
            onSimplifyTrigger={onSimplifyTrigger}
          />
        )}

        {feature === 'live-sign-captions' && (
          <div className="space-y-6">
            <div className="p-4 rounded-xl border border-aether-line/80 bg-aether-bg">
              <div className="flex items-center gap-2 mb-2">
                <Volume2 className="w-4 h-4 text-aether-glow" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-aether-deep">
                  Spatial Caption Stream & Sign Cues (Demo Model)
                </h3>
              </div>
              <p className="text-xs text-aether-deep/80 leading-relaxed mb-4">
                Demonstrates how live auditory instructions correlate with directional spatial indicators and visual signing cadence.
              </p>

              {/* Simulated Visual Sign Cadence Bar */}
              <div className="p-4 rounded-xl border border-aether-line bg-aether-soft/20 flex flex-col items-center justify-center gap-3">
                <div className="text-[11px] font-mono uppercase tracking-widest text-aether-deep/70">
                  Cadence Sync Rhythm
                </div>
                <div className="flex items-center gap-1.5 h-10">
                  {[40, 70, 25, 90, 55, 80, 30, 65, 85, 45, 95, 60].map((h, i) => (
                    <div
                      key={i}
                      className="w-2 rounded-full bg-aether-glow"
                      style={{
                        height: `${h}%`,
                        opacity: 0.35 + (h / 100) * 0.65,
                      }}
                    />
                  ))}
                </div>
                <span className="text-xs text-aether-deep font-semibold">
                  Sample Speech Cadence: 132 wpm (Phonetic Lock Active)
                </span>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-aether-line/60 bg-aether-bg text-xs text-aether-deep">
              <strong className="block font-semibold mb-1">Integration Specification:</strong>
              Connects to WebRTC video stream or spatial sign avatar pose coordinates (`PoseLandmark` arrays) without external cloud transmission.
            </div>
          </div>
        )}

        {feature === 'vernacular-bridge' && (
          <div className="space-y-6">
            <div className="p-4 rounded-xl border border-aether-line/80 bg-aether-bg">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="w-4 h-4 text-aether-glow" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-aether-deep">
                  Administrative Dialect Normalizer (Demo Model)
                </h3>
              </div>
              <p className="text-xs text-aether-deep/80 leading-relaxed mb-4">
                Ensures critical procedural deadlines and verification steps preserve exact administrative intent across regional languages.
              </p>

              <div className="space-y-2.5">
                <div className="p-3 rounded-lg border border-aether-line/60 bg-aether-soft/10 text-xs">
                  <div className="font-semibold text-aether-deep mb-1 text-[10px] uppercase tracking-wider">
                    Administrative Intent Verification
                  </div>
                  <div className="text-aether-deep">
                    Formal Clause: &ldquo;Failure to present dossier results in a 14-day hold&rdquo;
                  </div>
                  <div className="text-aether-deep font-mono text-[11px] mt-1 text-aether-glow">
                    Semantic Preservation Score: 99.4% (No penalty ambiguity introduced)
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-aether-line/60 bg-aether-bg text-xs text-aether-deep">
              <strong className="block font-semibold mb-1">Integration Specification:</strong>
              Slot ready for on-device or edge neural machine translation models with vocabulary constraint masks for legal and academic terminology.
            </div>
          </div>
        )}
      </div>

      {/* Drawer Footer */}
      <div className="p-3 border-t border-aether-line/40 bg-aether-bg flex items-center justify-between text-[11px] text-aether-deep/70">
        <div className="flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5 text-aether-glow" />
          <span>Fictional Demonstration Mode</span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-aether-deep font-bold hover:underline focus:outline-none focus:ring-1 focus:ring-aether-deep"
        >
          {strings.closeDrawer}
        </button>
      </div>
    </aside>
  );
};
