import React, { useState, useCallback, Suspense, lazy } from 'react';
import { HUD } from './components/HUD';
import { CalmModeLayout } from './components/CalmModeLayout';
import { TopBar } from './components/TopBar';
import { BottomDock } from './components/BottomDock';
import { WebGLFallback } from './components/WebGLFallback';
import { useCalmMode } from './hooks/useCalmMode';
import { FeatureId, LanguageCode } from './types/accessibility';
import { FEATURES } from './data/demoScenario';

// Dynamically import Scene3D to code-split the 3D WebGL bundle
const Scene3D = lazy(() =>
  import('./components/Scene3D').then((m) => ({ default: m.Scene3D }))
);

export const App: React.FC = () => {
  const [activeFeature, setActiveFeature] = useState<FeatureId | null>(null);
  const [language, setLanguage] = useState<LanguageCode>('en');
  const [simplifyActive, setSimplifyActive] = useState<boolean>(false);
  const [liveAnnouncement, setLiveAnnouncement] = useState<string>('');

  const {
    isCalmMode,
    systemPrefersReducedMotion,
    motionBlockedBySystem,
    announcement: calmAnnouncement,
    toggleCalmMode,
  } = useCalmMode();

  // Feature selection with accessible screen-reader announcement
  const handleFeatureSelect = useCallback(
    (feature: FeatureId | null) => {
      setActiveFeature(feature);
      if (feature) {
        const feat = FEATURES.find((f) => f.id === feature);
        setLiveAnnouncement(`Selected feature: ${feat?.title || feature}. Feature drawer opened.`);
      } else {
        setLiveAnnouncement('Feature drawer closed. 3D spatial scene focused.');
      }
    },
    []
  );

  // Voice trigger simulation handler
  const handleVoiceTrigger = useCallback(() => {
    setLiveAnnouncement('Speech input listening simulation triggered.');
  }, []);

  // Simplify trigger presentation toggle handler
  const handleSimplifyTrigger = useCallback(() => {
    setSimplifyActive((prev) => {
      const next = !prev;
      setLiveAnnouncement(
        next
          ? 'Simplify View enabled: presenting plain-language sample text.'
          : 'Standard View restored: presenting original academic notice.'
      );
      return next;
    });
  }, []);

  // Combined announcements for screen readers
  const currentAnnouncement = liveAnnouncement || calmAnnouncement;

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-aether-bg text-aether-deep font-sans">
      {/* Visual Live Region for Accessibility */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {currentAnnouncement}
      </div>

      {isCalmMode ? (
        /* Static High-Contrast Calm Mode Layout */
        <div className="w-full h-full overflow-y-auto flex flex-col justify-between">
          <TopBar
            activeFeature={activeFeature}
            onFeatureSelect={handleFeatureSelect}
            language={language}
            onLanguageChange={setLanguage}
            isCalm={isCalmMode}
            onToggleCalm={toggleCalmMode}
            motionBlockedBySystem={motionBlockedBySystem}
          />

          <div className="flex-1 pb-24">
            <CalmModeLayout
              activeFeature={activeFeature}
              onFeatureSelect={handleFeatureSelect}
              language={language}
              onLanguageChange={setLanguage}
              simplifyActive={simplifyActive}
              onVoiceTrigger={handleVoiceTrigger}
              onSimplifyTrigger={handleSimplifyTrigger}
            />
          </div>

          <BottomDock
            activeFeature={activeFeature}
            onFeatureSelect={handleFeatureSelect}
            onVoiceTrigger={handleVoiceTrigger}
            onSimplifyTrigger={handleSimplifyTrigger}
            simplifyActive={simplifyActive}
            language={language}
          />
        </div>
      ) : (
        /* Dynamic 3D Spatial Canvas with 2D HUD Layer */
        <div className="relative w-full h-full">
          {/* 3D Scene viewport (100vw x 100vh) */}
          <div className="absolute inset-0 z-0">
            <Suspense
              fallback={
                <WebGLFallback
                  activeFeature={activeFeature}
                  onFeatureSelect={handleFeatureSelect}
                  reason="Loading 3D Spatial Canvas"
                />
              }
            >
              <Scene3D
                activeFeature={activeFeature}
                onFeatureSelect={handleFeatureSelect}
                isCalm={isCalmMode || systemPrefersReducedMotion}
              />
            </Suspense>
          </div>

          {/* 2D HUD Layer (unobstructive, keeping >75% of canvas clear on desktop) */}
          <div className="absolute inset-0 z-20 pointer-events-none">
            <HUD
              activeFeature={activeFeature}
              onFeatureSelect={handleFeatureSelect}
              onVoiceTrigger={handleVoiceTrigger}
              onSimplifyTrigger={handleSimplifyTrigger}
              language={language}
              onLanguageChange={setLanguage}
              isCalm={isCalmMode}
              onToggleCalm={toggleCalmMode}
              motionBlockedBySystem={motionBlockedBySystem}
              simplifyActive={simplifyActive}
              announcement={currentAnnouncement}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
