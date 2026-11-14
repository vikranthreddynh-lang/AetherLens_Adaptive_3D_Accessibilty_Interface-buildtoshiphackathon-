import React from 'react';
import { FEATURES } from '../data/demoScenario';
import { FeatureId } from '../types/accessibility';
import { Compass, Sparkles, Layers } from 'lucide-react';

interface WebGLFallbackProps {
  activeFeature: FeatureId | null;
  onFeatureSelect: (feature: FeatureId | null) => void;
  reason?: string;
}

export const WebGLFallback: React.FC<WebGLFallbackProps> = ({
  activeFeature,
  onFeatureSelect,
  reason = 'WebGL 3D rendering context unavailable or disabled in this environment',
}) => {
  return (
    <div
      role="region"
      aria-label="2D Spatial Fallback Interface"
      className="relative w-full h-full min-h-[500px] flex flex-col items-center justify-center p-6 bg-aether-bg overflow-hidden"
    >
      {/* Decorative concentric floor rings simulation */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
        <div className="w-[500px] h-[500px] rounded-full border border-aether-line border-dashed animate-pulse" />
        <div className="absolute w-[360px] h-[360px] rounded-full border border-aether-soft" />
        <div className="absolute w-[220px] h-[220px] rounded-full border border-aether-line" />
      </div>

      {/* Fallback Notice Badge */}
      <div className="relative z-10 max-w-lg mx-auto text-center mb-8 p-4 rounded-xl border border-aether-line bg-aether-bg/90 backdrop-blur-sm shadow-aether-subtle">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase bg-aether-soft/30 text-aether-deep border border-aether-line/50 mb-2">
          <Compass className="w-3.5 h-3.5 text-aether-glow" />
          <span>Accessible 2D Spatial Fallback</span>
        </div>
        <h2 className="text-xl font-bold text-aether-deep tracking-tight">
          AetherLens Spatial Coordinate View
        </h2>
        <p className="text-xs text-aether-deep/80 mt-1">
          {reason}. All interactive pathways, drawer scenarios, and assistive controls remain fully operational below.
        </p>
      </div>

      {/* Interactive 2D Node Ring */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl w-full">
        {FEATURES.map((feature, idx) => {
          const isSelected = activeFeature === feature.id;
          return (
            <button
              key={feature.id}
              onClick={() => onFeatureSelect(isSelected ? null : feature.id)}
              className={`group flex flex-col items-start p-5 rounded-2xl border transition-all text-left focus:outline-none focus:ring-4 focus:ring-aether-deep ${
                isSelected
                  ? 'bg-aether-bg border-aether-glow shadow-aether-glow ring-2 ring-aether-deep'
                  : 'bg-aether-bg/80 hover:bg-aether-soft/20 border-aether-line/60 hover:border-aether-glow'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-3">
                <span className="text-[11px] font-mono tracking-widest text-aether-deep/70 uppercase">
                  {feature.badge}
                </span>
                <span
                  className={`w-3 h-3 rounded-full border ${
                    isSelected
                      ? 'bg-aether-glow border-aether-deep animate-ping'
                      : 'bg-aether-soft border-aether-line'
                  }`}
                />
              </div>

              <div className="flex items-center gap-2 mb-2">
                {idx === 0 && <Sparkles className="w-5 h-5 text-aether-glow flex-shrink-0" />}
                {idx === 1 && <Layers className="w-5 h-5 text-aether-glow flex-shrink-0" />}
                {idx === 2 && <Compass className="w-5 h-5 text-aether-glow flex-shrink-0" />}
                <h3 className="font-semibold text-base text-aether-deep group-hover:text-aether-deep">
                  {feature.title}
                </h3>
              </div>

              <p className="text-xs text-aether-deep/80 leading-relaxed mb-4">
                {feature.description}
              </p>

              <div className="mt-auto pt-3 border-t border-aether-line/30 w-full flex items-center justify-between text-xs font-medium">
                <span className="text-aether-deep">
                  {isSelected ? 'Active Feature Node' : 'Click to inspect pathway'}
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                    isSelected
                      ? 'bg-aether-deep text-aether-bg'
                      : 'bg-aether-soft/40 text-aether-deep'
                  }`}
                >
                  {isSelected ? 'Selected' : 'Open'}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
