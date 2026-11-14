import React from 'react';
import { HUDProps, LanguageCode } from '../types/accessibility';
import { TopBar } from './TopBar';
import { BottomDock } from './BottomDock';
import { FeatureDrawer } from './FeatureDrawer';

interface ExtendedHUDProps extends HUDProps {
  language: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
  isCalm: boolean;
  onToggleCalm: () => void;
  motionBlockedBySystem: boolean;
  simplifyActive: boolean;
  announcement: string;
}

export const HUD: React.FC<ExtendedHUDProps> = ({
  activeFeature,
  onFeatureSelect,
  onVoiceTrigger,
  onSimplifyTrigger,
  language,
  onLanguageChange,
  isCalm,
  onToggleCalm,
  motionBlockedBySystem,
  simplifyActive,
  announcement,
}) => {
  return (
    <div className="relative w-full h-full pointer-events-none select-none">
      {/* Live Screen Reader Announcements */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {announcement}
      </div>

      {/* Top Bar with Brand, Navigation & Calm Toggle */}
      <div className="pointer-events-auto">
        <TopBar
          activeFeature={activeFeature}
          onFeatureSelect={onFeatureSelect}
          language={language}
          onLanguageChange={onLanguageChange}
          isCalm={isCalm}
          onToggleCalm={onToggleCalm}
          motionBlockedBySystem={motionBlockedBySystem}
        />
      </div>

      {/* Contextual Feature Drawer when a node is selected */}
      {activeFeature && (
        <div className="pointer-events-auto">
          <FeatureDrawer
            feature={activeFeature}
            onClose={() => onFeatureSelect(null)}
            onVoiceTrigger={onVoiceTrigger}
            onSimplifyTrigger={onSimplifyTrigger}
            language={language}
            onLanguageChange={onLanguageChange}
            simplifyActive={simplifyActive}
          />
        </div>
      )}

      {/* Floating Bottom Dock */}
      <BottomDock
        activeFeature={activeFeature}
        onFeatureSelect={onFeatureSelect}
        onVoiceTrigger={onVoiceTrigger}
        onSimplifyTrigger={onSimplifyTrigger}
        simplifyActive={simplifyActive}
        language={language}
      />
    </div>
  );
};
