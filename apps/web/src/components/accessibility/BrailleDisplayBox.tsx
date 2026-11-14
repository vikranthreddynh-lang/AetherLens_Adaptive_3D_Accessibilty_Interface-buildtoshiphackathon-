import React from 'react';
import { Terminal } from 'lucide-react';

interface BrailleDisplayBoxProps {
  brailleText: string;
  sourceModalities?: string[];
  observedAt?: string;
  priority?: string;
}

export const BrailleDisplayBox: React.FC<BrailleDisplayBoxProps> = ({
  brailleText,
  sourceModalities = [],
  observedAt,
  priority = 'normal',
}) => {
  return (
    <section
      aria-label="Refreshable Braille Output Buffer"
      className="bg-slate-900 border-2 border-slate-700 rounded-xl p-4 shadow-inner"
    >
      <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
        <div className="flex items-center space-x-2">
          <Terminal className="w-4 h-4 text-sense-400" aria-hidden="true" />
          <span className="font-semibold uppercase tracking-wider text-slate-300">
            Braille Display Terminal
          </span>
        </div>
        <div className="flex items-center space-x-2">
          {priority === 'high' && (
            <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-300 text-xs font-bold border border-rose-800">
              HIGH PRIORITY
            </span>
          )}
          {observedAt && (
            <time className="text-slate-400 text-xs">
              {new Date(observedAt).toLocaleTimeString()}
            </time>
          )}
        </div>
      </div>

      {/* Braille Display Output Region */}
      <div
        role="region"
        aria-live="polite"
        aria-label="Braille Formatted Stream"
        tabIndex={0}
        className="font-mono text-base sm:text-lg text-emerald-400 bg-black/60 p-3.5 rounded-lg border border-slate-800 break-words leading-relaxed select-all"
      >
        {brailleText || '[IDLE] Waiting for observable environmental signal...'}
      </div>

      <div className="mt-2.5 flex items-center justify-between text-xs text-slate-400">
        <span>Optimized for 40-cell & 80-cell refreshable Braille pins</span>
        {sourceModalities.length > 0 && (
          <span className="capitalize text-slate-400">
            Modality: {sourceModalities.join(', ')}
          </span>
        )}
      </div>
    </section>
  );
};
