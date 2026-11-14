import React from 'react';
import { Sparkles, Globe, EyeOff, Play, ShieldAlert } from 'lucide-react';
import { FeatureId, LanguageCode } from '../types/accessibility';
import { FEATURES, UI_STRINGS } from '../data/demoScenario';

interface TopBarProps {
  activeFeature: FeatureId | null;
  onFeatureSelect: (feature: FeatureId | null) => void;
  language: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
  isCalm: boolean;
  onToggleCalm: () => void;
  motionBlockedBySystem: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({
  activeFeature,
  onFeatureSelect,
  language,
  onLanguageChange,
  isCalm,
  onToggleCalm,
  motionBlockedBySystem,
}) => {
  const strings = UI_STRINGS[language] || UI_STRINGS.en;

  return (
    <header
      role="banner"
      className="w-full px-4 py-3 md:px-8 border-b border-aether-line/40 bg-aether-bg/95 backdrop-blur-md z-30 transition-colors"
    >
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Brand Wordmark & Subtitle */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-aether-glow/20 border border-aether-glow flex items-center justify-center text-aether-deep shadow-aether-subtle">
            <Sparkles className="w-5 h-5 text-aether-deep" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg md:text-xl font-bold tracking-tight text-aether-deep leading-none">
                {strings.appTitle}
              </h1>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full border border-aether-line/60 bg-aether-soft/30 text-aether-deep">
                Shell v0.1
              </span>
            </div>
            <p className="text-xs text-aether-deep/75 font-medium tracking-normal mt-0.5">
              {strings.appSubtitle}
            </p>
          </div>
        </div>

        {/* Feature Node Navigation Pills */}
        <nav
          aria-label="Spatial Feature Navigation"
          className="hidden lg:flex items-center gap-1.5 p-1 rounded-xl bg-aether-soft/25 border border-aether-line/50"
        >
          {FEATURES.map((feature) => {
            const isSelected = activeFeature === feature.id;
            return (
              <button
                key={feature.id}
                type="button"
                onClick={() => onFeatureSelect(isSelected ? null : feature.id)}
                aria-pressed={isSelected}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-aether-deep ${
                  isSelected
                    ? 'bg-aether-deep text-aether-bg shadow-sm'
                    : 'text-aether-deep hover:bg-aether-glow/20'
                }`}
              >
                {feature.title}
              </button>
            );
          })}
        </nav>

        {/* Controls: Language Dropdown & Calm Mode Toggle */}
        <div className="flex items-center gap-2.5">
          {/* Language Selector */}
          <div className="relative inline-flex items-center">
            <label htmlFor="language-selector" className="sr-only">
              Select Language
            </label>
            <div className="absolute left-2.5 pointer-events-none text-aether-deep">
              <Globe className="w-3.5 h-3.5 text-aether-deep" />
            </div>
            <select
              id="language-selector"
              value={language}
              onChange={(e) => onLanguageChange(e.target.value as LanguageCode)}
              aria-label="Select Interface Language"
              className="pl-8 pr-7 py-1.5 rounded-lg border border-aether-line text-xs font-semibold bg-aether-bg text-aether-deep hover:border-aether-deep focus:outline-none focus:ring-2 focus:ring-aether-deep appearance-none cursor-pointer"
            >
              <option value="en">English (EN)</option>
              <option value="hi">हिंदी (Hindi)</option>
              <option value="ta">தமிழ் (Tamil)</option>
              <option value="bn">বাংলা (Bengali)</option>
            </select>
            <span className="absolute right-2 pointer-events-none text-[10px] text-aether-deep">
              ▼
            </span>
          </div>

          {/* Calm Mode Toggle Button */}
          <button
            type="button"
            onClick={onToggleCalm}
            aria-pressed={isCalm}
            aria-label={`${strings.calmMode}: ${isCalm ? 'Enabled' : 'Disabled'}`}
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-aether-deep ${
              isCalm
                ? 'bg-aether-deep text-aether-bg border-aether-deep shadow-sm'
                : 'bg-aether-bg text-aether-deep border-aether-line hover:border-aether-deep'
            }`}
          >
            {isCalm ? (
              <EyeOff className="w-3.5 h-3.5 text-aether-bg" />
            ) : (
              <Play className="w-3.5 h-3.5 text-aether-deep" />
            )}
            <span>{strings.calmMode}</span>
            <span
              className={`w-2 h-2 rounded-full ${
                isCalm ? 'bg-aether-glow' : 'bg-aether-soft'
              }`}
            />
          </button>
        </div>
      </div>

      {/* System Reduced Motion Advisory Notification */}
      {motionBlockedBySystem && (
        <div
          role="status"
          className="mt-2 text-center text-[11px] font-medium text-aether-deep bg-aether-soft/30 py-1 px-3 rounded border border-aether-line/50 flex items-center justify-center gap-1.5"
        >
          <ShieldAlert className="w-3.5 h-3.5 text-aether-glow" />
          <span>{strings.motionPausedBySystem}</span>
        </div>
      )}
    </header>
  );
};
