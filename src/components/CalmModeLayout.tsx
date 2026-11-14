import React from 'react';
import { EyeOff, MessageSquare, Volume2 } from 'lucide-react';
import { FeatureId, LanguageCode } from '../types/accessibility';
import { FEATURES, UI_STRINGS } from '../data/demoScenario';
import { WhatIfDemo } from './WhatIfDemo';

interface CalmModeLayoutProps {
  activeFeature: FeatureId | null;
  onFeatureSelect: (feature: FeatureId | null) => void;
  language: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
  simplifyActive: boolean;
  onVoiceTrigger: () => void;
  onSimplifyTrigger: () => void;
}

export const CalmModeLayout: React.FC<CalmModeLayoutProps> = ({
  activeFeature,
  onFeatureSelect,
  language,
  onLanguageChange,
  simplifyActive,
  onVoiceTrigger,
  onSimplifyTrigger,
}) => {
  const strings = UI_STRINGS[language] || UI_STRINGS.en;
  const currentFeature = activeFeature || 'what-if-pathways';

  return (
    <main
      role="main"
      aria-label="Calm Mode Static Accessible Interface"
      className="relative z-10 max-w-6xl mx-auto px-4 py-8 space-y-8"
    >
      {/* Calm Mode Header Card */}
      <section className="p-6 rounded-2xl border-2 border-aether-deep bg-aether-bg shadow-aether-subtle">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-aether-deep text-aether-bg">
              <EyeOff className="w-3.5 h-3.5" />
              <span>{strings.calmModeActive}</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-aether-deep tracking-tight">
              Static High-Contrast Accessible View
            </h2>
            <p className="text-xs md:text-sm text-aether-deep/85">
              {strings.calmModeStaticPrompt} Full access to the What-If Pathway Engine and spatial features with zero movement.
            </p>
          </div>

          {/* Feature selector tabs */}
          <div className="flex flex-wrap items-center gap-2" role="tablist" aria-label="Feature Tabs">
            {FEATURES.map((feature) => {
              const isSelected = currentFeature === feature.id;
              return (
                <button
                  key={feature.id}
                  role="tab"
                  id={`tab-${feature.id}`}
                  aria-selected={isSelected}
                  aria-controls={`tabpanel-${feature.id}`}
                  type="button"
                  onClick={() => onFeatureSelect(feature.id)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all focus:outline-none focus:ring-2 focus:ring-aether-deep ${
                    isSelected
                      ? 'bg-aether-deep text-aether-bg border-aether-deep shadow-sm'
                      : 'bg-aether-bg text-aether-deep border-aether-line hover:border-aether-deep'
                  }`}
                >
                  {feature.title}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Active Tab Panel Content */}
      <section
        id={`tabpanel-${currentFeature}`}
        role="tabpanel"
        aria-labelledby={`tab-${currentFeature}`}
        className="p-6 rounded-2xl border-2 border-aether-line bg-aether-bg shadow-aether-subtle"
      >
        {currentFeature === 'what-if-pathways' && (
          <WhatIfDemo
            language={language}
            onLanguageChange={onLanguageChange}
            simplifyActive={simplifyActive}
            onVoiceTrigger={onVoiceTrigger}
            onSimplifyTrigger={onSimplifyTrigger}
          />
        )}

        {currentFeature === 'live-sign-captions' && (
          <div className="space-y-6">
            <div className="p-4 rounded-xl border border-aether-line bg-aether-bg">
              <div className="flex items-center gap-2 mb-2">
                <Volume2 className="w-5 h-5 text-aether-glow" />
                <h3 className="text-base font-bold text-aether-deep">
                  Live Sign & Captions (Static Accessible View)
                </h3>
              </div>
              <p className="text-xs text-aether-deep/85 leading-relaxed mb-4">
                In calm mode, live animations are paused. Caption text is presented with steady high-contrast typography and static rhythm guides.
              </p>

              <div className="p-4 rounded-xl border border-aether-line/80 bg-aether-soft/20 text-xs text-aether-deep">
                <div className="font-bold uppercase tracking-wider mb-2">Static Speech Stream:</div>
                <p className="italic text-aether-deep">
                  &ldquo;All registered candidates must present their physical student verification dossier at Student Services Hall, Room 204...&rdquo;
                </p>
                <div className="mt-3 text-[11px] font-semibold text-aether-deep">
                  Status: Steady text projection active • Motion paused
                </div>
              </div>
            </div>
          </div>
        )}

        {currentFeature === 'vernacular-bridge' && (
          <div className="space-y-6">
            <div className="p-4 rounded-xl border border-aether-line bg-aether-bg">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="w-5 h-5 text-aether-glow" />
                <h3 className="text-base font-bold text-aether-deep">
                  Vernacular Bridge (Static Accessible View)
                </h3>
              </div>
              <p className="text-xs text-aether-deep/85 leading-relaxed mb-4">
                Dialect translation with procedural fidelity check.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-aether-line/60 bg-aether-soft/10">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-aether-deep/70 mb-1">
                    Standard Academic English
                  </div>
                  <p className="text-xs text-aether-deep">
                    &ldquo;Failure to present the dossier in person will result in a 14-day hold on laboratory privileges.&rdquo;
                  </p>
                </div>
                <div className="p-4 rounded-xl border border-aether-line/60 bg-aether-soft/10">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-aether-deep/70 mb-1">
                    Verified Regional Equivalence
                  </div>
                  <p className="text-xs text-aether-deep">
                    Administrative penalty remains strictly fixed: 14-day lab access delay if verification is missed.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>
    </main>
  );
};
