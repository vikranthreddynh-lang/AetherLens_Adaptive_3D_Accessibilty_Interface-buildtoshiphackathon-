import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { SkipLink } from './SkipLink.js';
import { PublicHeader } from './PublicHeader.js';
import { PublicFooter } from './PublicFooter.js';
import { LiveRegion } from '../accessibility/LiveRegion.js';
import { Smartphone } from 'lucide-react';

export const AppLayout: React.FC = () => {
  const [hapticPulse, setHapticPulse] = useState<{ patternName: string } | null>(null);

  useEffect(() => {
    const handleHapticFallback = (e: CustomEvent<{ patternName: string; pattern: number[] }>) => {
      setHapticPulse({ patternName: e.detail.patternName });
      const timer = setTimeout(() => {
        setHapticPulse(null);
      }, 700);
      return () => clearTimeout(timer);
    };

    window.addEventListener('senseweave:haptic_fallback' as never, handleHapticFallback as never);
    return () => {
      window.removeEventListener('senseweave:haptic_fallback' as never, handleHapticFallback as never);
    };
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 antialiased">
      <SkipLink />
      <PublicHeader />

      <main id="main-content" tabIndex={-1} className="flex-1 flex flex-col outline-none">
        <Outlet />
      </main>

      <PublicFooter />
      <LiveRegion />

      {/* Visual Haptic Fallback Toast indicator (for desktop or browsers without vibration motor) */}
      {hapticPulse && (
        <aside
          role="status"
          aria-live="polite"
          aria-label="Tactile pulse active"
          className="fixed bottom-5 right-5 z-50 bg-sense-600/90 text-white px-3.5 py-2 rounded-full shadow-2xl border border-sense-400 flex items-center space-x-2 text-xs font-semibold animate-pulse"
        >
          <Smartphone className="w-4 h-4 animate-bounce" aria-hidden="true" />
          <span>Haptic: {hapticPulse.patternName.replace(/_/g, ' ')}</span>
        </aside>
      )}
    </div>
  );
};
