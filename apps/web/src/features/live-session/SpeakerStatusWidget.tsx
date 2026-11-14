import React from 'react';
import { Users, AlertTriangle, MessageSquare } from 'lucide-react';

interface SpeakerStatusWidgetProps {
  currentSpeaker: string | null;
  isOverlapping: boolean;
  recentSpeakers: string[];
}

export const SpeakerStatusWidget: React.FC<SpeakerStatusWidgetProps> = ({
  currentSpeaker,
  isOverlapping,
  recentSpeakers,
}) => {
  return (
    <div
      role="region"
      aria-label="Conversation Dynamics and Speaker Turn Status"
      className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <MessageSquare className="w-4 h-4 text-sense-400" aria-hidden="true" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Conversation Dynamics
          </h2>
        </div>

        {isOverlapping && (
          <span
            role="status"
            className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-bold flex items-center space-x-1 animate-pulse"
          >
            <AlertTriangle className="w-3 h-3 text-rose-400" aria-hidden="true" />
            <span>Overlapping Voices</span>
          </span>
        )}
      </div>

      <div className="flex items-center space-x-4">
        {/* Active speaker indicator */}
        <div className="flex-1 bg-slate-950/70 p-3 rounded-lg border border-slate-800">
          <span className="text-[11px] text-slate-400 block mb-0.5">Current Speaker</span>
          <div className="flex items-center space-x-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                currentSpeaker ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'
              }`}
              aria-hidden="true"
            />
            <span className="font-semibold text-white text-sm sm:text-base">
              {currentSpeaker || 'No active speech'}
            </span>
          </div>
        </div>

        {/* Recent speakers sequence */}
        <div className="flex-1 bg-slate-950/70 p-3 rounded-lg border border-slate-800">
          <span className="text-[11px] text-slate-400 block mb-0.5">Turn History</span>
          <div className="flex items-center space-x-1.5 overflow-x-auto text-xs text-slate-300">
            {recentSpeakers.length > 0 ? (
              recentSpeakers.slice(-3).map((spk, idx) => (
                <React.Fragment key={idx}>
                  {idx > 0 && <span className="text-slate-400">→</span>}
                  <span className="bg-slate-800 px-2 py-0.5 rounded text-[11px] font-mono">
                    {spk}
                  </span>
                </React.Fragment>
              ))
            ) : (
              <span className="text-slate-400 text-xs italic">Awaiting dialogue</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
