import React from 'react';
import {
  EnvironmentalEvent,
  EventCertainty,
  EventPriority,
} from '@senseweave/shared';
import {
  Volume2,
  Eye,
  Hand,
  Clock,
  MapPin,
  ShieldAlert,
  Users,
  Radio,
  FileText,
} from 'lucide-react';

interface EventCardProps {
  event: EnvironmentalEvent;
  isLatest?: boolean;
}

export const EventCard: React.FC<EventCardProps> = ({ event, isLatest = false }) => {
  const certaintyBadge = (cert: EventCertainty) => {
    switch (cert) {
      case 'clear':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800">
            Clear Evidence
          </span>
        );
      case 'uncertain':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-950 text-amber-300 border border-amber-800">
            Uncertain
          </span>
        );
      case 'insufficient':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-950 text-rose-300 border border-rose-800">
            Limited Input
          </span>
        );
    }
  };

  const priorityBadge = (priority: EventPriority) => {
    if (priority === 'high') {
      return (
        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-600 text-white animate-pulse">
          HIGH
        </span>
      );
    }
    if (priority === 'low') {
      return (
        <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-800 text-slate-400">
          Background
        </span>
      );
    }
    return null;
  };

  const modalityIcon = (mod: string) => {
    switch (mod) {
      case 'audio':
        return (
          <span key={mod} title="Audio modality">
            <Volume2 className="w-3.5 h-3.5 text-sky-400" aria-hidden="true" />
          </span>
        );
      case 'visual':
        return (
          <span key={mod} title="Visual camera modality">
            <Eye className="w-3.5 h-3.5 text-amber-400" aria-hidden="true" />
          </span>
        );
      case 'local_visual':
        return (
          <span key={mod} title="On-device gesture modality">
            <Hand className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
          </span>
        );
      default:
        return (
          <span key={mod} title="Text modality">
            <FileText className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
          </span>
        );
    }
  };

  const spatialDisplay = () => {
    const { horizontal, basis } = event.relativePosition;
    if (horizontal === 'unknown' || basis === 'unknown') {
      return 'Direction unknown';
    }
    const prefix = basis === 'camera_frame' ? 'Camera-' : '';
    return `${prefix}${horizontal.charAt(0).toUpperCase() + horizontal.slice(1)}`;
  };

  return (
    <article
      aria-label={`Event: ${event.description}`}
      className={`p-4 rounded-xl border transition-all ${
        isLatest
          ? 'bg-slate-900 border-sense-400 shadow-xl shadow-sense-950/50 ring-2 ring-sense-500/20'
          : event.status === 'expired'
          ? 'bg-slate-950/40 border-slate-900 opacity-60'
          : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
      }`}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex flex-wrap items-center gap-1.5">
          {priorityBadge(event.priority)}
          {certaintyBadge(event.certainty)}
          {event.speakerLabel && (
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-800 text-sense-300 border border-slate-700 flex items-center space-x-1">
              <Users className="w-3 h-3" aria-hidden="true" />
              <span>{event.speakerLabel}</span>
            </span>
          )}
          {isLatest && (
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-sense-500 text-white">
              LATEST
            </span>
          )}
        </div>

        <div className="flex items-center space-x-2 text-xs text-slate-400 shrink-0">
          <Clock className="w-3.5 h-3.5" aria-hidden="true" />
          <time dateTime={event.observedAt}>
            {new Date(event.observedAt).toLocaleTimeString()}
          </time>
        </div>
      </div>

      {/* Description */}
      <h3 className="text-sm sm:text-base font-semibold text-white leading-snug mb-1.5">
        {event.description}
      </h3>

      {/* Observable Evidence Quote */}
      {event.observableEvidence && (
        <p className="text-xs text-slate-400 italic bg-black/30 px-2.5 py-1.5 rounded border border-slate-800/80 mb-3">
          Observable evidence: {event.observableEvidence}
        </p>
      )}

      {/* Modalities & Spatial origin */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/60 text-xs text-slate-400">
        <div className="flex items-center space-x-2">
          <span className="text-[11px] uppercase tracking-wider text-slate-400">Source:</span>
          <div className="flex items-center space-x-1.5">
            {event.sourceModalities.map(modalityIcon)}
            <span className="capitalize">{event.sourceModalities.join(' + ')}</span>
          </div>
        </div>

        <div className="flex items-center space-x-1 text-slate-400">
          <MapPin className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
          <span>{spatialDisplay()}</span>
        </div>
      </div>
    </article>
  );
};
