import React from 'react';
import { Shield, Lock, EyeOff, Trash2, Database, Key } from 'lucide-react';

export const PrivacyPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="space-y-3 text-center">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-sense-950 text-sense-400 border border-sense-800 text-xs font-semibold">
          <Shield className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Privacy & Data Sovereignty</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
          Privacy, Consent & Data Retention
        </h1>
        <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto">
          SenseWeave is engineered from the ground up to protect individual dignity and environmental privacy.
        </p>
      </div>

      <div className="space-y-6 text-sm text-slate-300">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
          <div className="flex items-center space-x-2.5 text-white font-bold text-base">
            <EyeOff className="w-5 h-5 text-sense-400" aria-hidden="true" />
            <h2>Zero Raw Media Storage</h2>
          </div>
          <p className="leading-relaxed">
            SenseWeave does not record, buffer to disk, or persist raw environmental microphone audio or camera frames by default. Audio chunks and sampled camera frames exist in short-lived volatile memory solely for real-time model evaluation and are immediately discarded.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
          <div className="flex items-center space-x-2.5 text-white font-bold text-base">
            <Lock className="w-5 h-5 text-sense-400" aria-hidden="true" />
            <h2>Strict Exclusion of Biometric & Facial Recognition</h2>
          </div>
          <p className="leading-relaxed">
            SenseWeave strictly rejects biometric profiling. The system does not create facial embeddings, voiceprints, or identity registries. People in the scene are identified exclusively through anonymous temporary session labels (such as "Speaker A" and "Speaker B") that expire when the session ends.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
          <div className="flex items-center space-x-2.5 text-white font-bold text-base">
            <Database className="w-5 h-5 text-sense-400" aria-hidden="true" />
            <h2>User-Controlled Session Recaps & Row Level Security (RLS)</h2>
          </div>
          <p className="leading-relaxed">
            Session recaps and event timelines are never persisted to a database unless the user explicitly clicks "Save Session". All saved session data is isolated by Supabase Row Level Security (RLS) policies tied to the authenticated user ID. No other user can access or query your saved sessions.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
          <div className="flex items-center space-x-2.5 text-white font-bold text-base">
            <Key className="w-5 h-5 text-sense-400" aria-hidden="true" />
            <h2>Short-Lived, Single-Use Connection Tickets</h2>
          </div>
          <p className="leading-relaxed">
            Browser clients never receive permanent AI credentials or server database service keys. Real-time WebSocket connections use short-lived, cryptographically secure one-time tickets that expire in 60 seconds and are immediately invalidated on first use to prevent replay attacks.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
          <div className="flex items-center space-x-2.5 text-white font-bold text-base">
            <Trash2 className="w-5 h-5 text-rose-400" aria-hidden="true" />
            <h2>Right of Erasure & Account Deletion</h2>
          </div>
          <p className="leading-relaxed">
            You maintain full sovereignty over your data. You can delete any saved session at any time from your dashboard. Under Settings &gt; Privacy, you can trigger complete account deletion, which cascades through the database and erases all associated profiles, sessions, and events permanently.
          </p>
        </div>
      </div>
    </div>
  );
};
