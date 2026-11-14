import React from 'react';
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Pause,
  Play,
  Square,
  VolumeX,
  Volume2,
  MessageSquarePlus,
} from 'lucide-react';

interface LiveControlToolbarProps {
  cameraActive: boolean;
  micActive: boolean;
  isPaused: boolean;
  quietMode: boolean;
  onToggleCamera: () => void;
  onToggleMic: () => void;
  onTogglePause: () => void;
  onToggleQuietMode: () => void;
  onStop: () => void;
  onOpenFeedback: () => void;
}

export const LiveControlToolbar: React.FC<LiveControlToolbarProps> = ({
  cameraActive,
  micActive,
  isPaused,
  quietMode,
  onToggleCamera,
  onToggleMic,
  onTogglePause,
  onToggleQuietMode,
  onStop,
  onOpenFeedback,
}) => {
  return (
    <div
      role="toolbar"
      aria-label="Live Environmental Session Controls"
      className="bg-slate-900/95 backdrop-blur border border-slate-800 p-2.5 rounded-2xl shadow-xl flex flex-wrap items-center justify-between gap-2"
    >
      <div className="flex items-center space-x-1.5 sm:space-x-2">
        {/* Camera Toggle */}
        <button
          onClick={onToggleCamera}
          className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center space-x-1.5 transition-colors ${
            cameraActive
              ? 'bg-slate-800 text-white hover:bg-slate-700'
              : 'bg-rose-950 text-rose-300 border border-rose-800 hover:bg-rose-900'
          }`}
          aria-pressed={cameraActive}
          aria-label={cameraActive ? 'Turn camera off' : 'Turn camera on'}
        >
          {cameraActive ? (
            <Video className="w-4 h-4 text-emerald-400" aria-hidden="true" />
          ) : (
            <VideoOff className="w-4 h-4 text-rose-400" aria-hidden="true" />
          )}
          <span className="hidden sm:inline">{cameraActive ? 'Camera On' : 'Camera Off'}</span>
        </button>

        {/* Microphone Toggle */}
        <button
          onClick={onToggleMic}
          className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center space-x-1.5 transition-colors ${
            micActive
              ? 'bg-slate-800 text-white hover:bg-slate-700'
              : 'bg-rose-950 text-rose-300 border border-rose-800 hover:bg-rose-900'
          }`}
          aria-pressed={micActive}
          aria-label={micActive ? 'Turn microphone off' : 'Turn microphone on'}
        >
          {micActive ? (
            <Mic className="w-4 h-4 text-emerald-400" aria-hidden="true" />
          ) : (
            <MicOff className="w-4 h-4 text-rose-400" aria-hidden="true" />
          )}
          <span className="hidden sm:inline">{micActive ? 'Mic On' : 'Mic Off'}</span>
        </button>

        {/* Pause / Resume */}
        <button
          onClick={onTogglePause}
          className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center space-x-1.5 transition-colors ${
            isPaused
              ? 'bg-amber-950 text-amber-300 border border-amber-800 hover:bg-amber-900'
              : 'bg-slate-800 text-white hover:bg-slate-700'
          }`}
          aria-pressed={isPaused}
          aria-label={isPaused ? 'Resume live monitoring' : 'Pause live monitoring'}
        >
          {isPaused ? (
            <Play className="w-4 h-4 text-amber-400" aria-hidden="true" />
          ) : (
            <Pause className="w-4 h-4 text-slate-300" aria-hidden="true" />
          )}
          <span className="hidden sm:inline">{isPaused ? 'Resume' : 'Pause'}</span>
        </button>

        {/* Quiet Mode */}
        <button
          onClick={onToggleQuietMode}
          className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center space-x-1.5 transition-colors ${
            quietMode
              ? 'bg-purple-950 text-purple-300 border border-purple-800'
              : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
          }`}
          aria-pressed={quietMode}
          aria-label={quietMode ? 'Quiet mode enabled (critical alerts only)' : 'Enable quiet mode'}
          title="Quiet Mode"
        >
          {quietMode ? (
            <VolumeX className="w-4 h-4 text-purple-400" aria-hidden="true" />
          ) : (
            <Volume2 className="w-4 h-4 text-slate-400" aria-hidden="true" />
          )}
          <span className="hidden md:inline">{quietMode ? 'Quiet Mode' : 'Normal'}</span>
        </button>
      </div>

      <div className="flex items-center space-x-2">
        {/* Feedback dialog */}
        <button
          onClick={onOpenFeedback}
          className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 text-xs flex items-center space-x-1"
          aria-label="Submit observation feedback"
          title="Feedback"
        >
          <MessageSquarePlus className="w-4 h-4" aria-hidden="true" />
          <span className="hidden lg:inline">Feedback</span>
        </button>

        {/* Stop Session Button */}
        <button
          onClick={onStop}
          className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs sm:text-sm flex items-center space-x-1.5 transition-all shadow-lg shadow-rose-600/20"
          aria-label="Stop environmental awareness session"
        >
          <Square className="w-4 h-4 fill-white" aria-hidden="true" />
          <span>Stop Session</span>
        </button>
      </div>
    </div>
  );
};
