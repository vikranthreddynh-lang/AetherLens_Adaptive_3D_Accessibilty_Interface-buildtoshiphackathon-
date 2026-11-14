import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  SavedSessionRecord,
  EnvironmentType,
  ENVIRONMENT_PROFILES_INFO,
} from '@senseweave/shared';
import { apiClient } from '../lib/api/client.js';
import { useAuth } from '../hooks/useAuth.js';
import {
  LayoutDashboard,
  Radio,
  Clock,
  Trash2,
  Sliders,
  Filter,
  FileText,
  Shield,
  ArrowRight,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<SavedSessionRecord[]>([]);
  const [selectedEnvFilter, setSelectedEnvFilter] = useState<string>('');
  const [loading, setLoading] = useState(true);

  const fetchSessions = () => {
    setLoading(true);
    apiClient
      .listSavedSessions(selectedEnvFilter || undefined)
      .then((data) => setSessions(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchSessions();
  }, [selectedEnvFilter]);

  const handleDelete = async (sessionId: string) => {
    if (!confirm('Are you sure you want to delete this saved session? This cannot be undone.')) {
      return;
    }
    try {
      await apiClient.deleteSavedSession(sessionId);
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    } catch {
      // Catch
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Welcome Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2 text-sense-400 text-xs font-bold uppercase tracking-wider mb-1">
            <LayoutDashboard className="w-4 h-4" aria-hidden="true" />
            <span>Private User Dashboard</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white">
            Welcome back{user?.email ? `, ${user.email.split('@')[0]}` : ''}
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Review your saved environmental recaps or launch a new live awareness session.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            to="/settings/accessibility"
            className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 flex items-center space-x-1.5 text-xs font-semibold"
            aria-label="Sensory Settings"
          >
            <Sliders className="w-4 h-4" aria-hidden="true" />
            <span className="hidden sm:inline">Settings</span>
          </Link>

          <Link
            to="/session/new"
            className="px-5 py-2.5 rounded-xl bg-sense-600 hover:bg-sense-500 text-white font-bold text-sm shadow-md shadow-sense-600/20 flex items-center space-x-2"
          >
            <Radio className="w-4 h-4 animate-pulse" aria-hidden="true" />
            <span>New Live Session</span>
          </Link>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-3.5 rounded-2xl">
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-slate-400" aria-hidden="true" />
          <span className="text-xs font-semibold text-slate-300">Filter by Environment:</span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setSelectedEnvFilter('')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              selectedEnvFilter === ''
                ? 'bg-sense-600 text-white'
                : 'bg-slate-950 text-slate-400 hover:text-white'
            }`}
          >
            All Environments
          </button>
          {(Object.keys(ENVIRONMENT_PROFILES_INFO) as EnvironmentType[]).map((envKey) => (
            <button
              key={envKey}
              onClick={() => setSelectedEnvFilter(envKey)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors capitalize ${
                selectedEnvFilter === envKey
                  ? 'bg-sense-600 text-white'
                  : 'bg-slate-950 text-slate-400 hover:text-white'
              }`}
            >
              {envKey.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Sessions List */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-white flex items-center space-x-2">
          <span>Saved Session Recaps</span>
          <span className="text-xs font-normal text-slate-400">({sessions.length})</span>
        </h2>

        {loading ? (
          <div className="py-16 text-center text-slate-400 text-sm">
            Loading saved sessions...
          </div>
        ) : sessions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sessions.map((sess) => (
              <div
                key={sess.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 hover:border-slate-700 transition-all flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <span className="px-2.5 py-0.5 rounded-md bg-sense-950 text-sense-300 border border-sense-800 text-[11px] font-mono capitalize">
                      {sess.environmentType.replace(/_/g, ' ')}
                    </span>
                    <time className="text-xs text-slate-400 flex items-center space-x-1">
                      <Clock className="w-3 h-3" aria-hidden="true" />
                      <span>{new Date(sess.savedAt).toLocaleDateString()}</span>
                    </time>
                  </div>

                  <h3 className="font-bold text-white text-base leading-snug">
                    {sess.title}
                  </h3>

                  <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                    {sess.summary}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                  <Link
                    to={`/session/${sess.id}/recap`}
                    className="text-xs font-bold text-sense-400 hover:text-sense-300 flex items-center space-x-1"
                  >
                    <span>View Full Recap</span>
                    <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                  </Link>

                  <button
                    onClick={() => handleDelete(sess.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                    aria-label={`Delete saved session: ${sess.title}`}
                    title="Delete session"
                  >
                    <Trash2 className="w-4 h-4" aria-hidden="true" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center bg-slate-900/40 border border-slate-800 rounded-2xl space-y-3">
            <FileText className="w-8 h-8 text-slate-400 mx-auto" aria-hidden="true" />
            <h3 className="text-sm font-bold text-white">No Saved Sessions</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              You haven't saved any session summaries yet. After completing a live awareness session, you can review and save its sanitized recap.
            </p>
            <div className="pt-2">
              <Link
                to="/session/new"
                className="px-4 py-2 rounded-xl bg-sense-600 hover:bg-sense-500 text-white font-semibold text-xs inline-flex items-center space-x-1.5"
              >
                <Radio className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Start New Session</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
