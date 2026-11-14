import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, Heart, Accessibility } from 'lucide-react';
import { TAGLINE } from '@senseweave/shared';

export const PublicFooter: React.FC = () => {
  return (
    <footer className="bg-slate-950 border-t border-slate-900 text-slate-400 text-sm mt-auto" role="contentinfo">
      {/* Crucial Safety Notice Banner */}
      <div className="bg-amber-950/40 border-b border-amber-900/50 py-3 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-start sm:items-center space-x-3 text-amber-200/90 text-xs sm:text-sm">
          <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5 sm:mt-0" aria-hidden="true" />
          <p>
            <strong>Critical Safety Notice:</strong> SenseWeave is an environmental awareness and social-context assistant. It does <em>not</em> provide mobility or navigation instructions and does <em>not</em> replace a white cane, guide dog, or mobility training. Always rely on established mobility aids.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center space-x-2 text-white font-bold text-lg">
              <span className="w-2.5 h-2.5 rounded-full bg-sense-400"></span>
              <span>SenseWeave</span>
            </div>
            <p className="text-slate-400 text-sm max-w-md">
              {TAGLINE} Real-time contextual translation of speech activity, speaker transitions, observable gestures, and physical environment cues into user-controlled sensory feedback.
            </p>
            <div className="flex items-center space-x-2 text-xs text-slate-400 pt-1">
              <Accessibility className="w-4 h-4 text-sense-400" aria-hidden="true" />
              <span>Designed with DeafBlind and low-vision accessibility principles.</span>
            </div>
          </div>

          <div>
            <h2 className="text-white font-semibold text-sm mb-3">Explore</h2>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <Link to="/demo" className="hover:text-white transition-colors">
                  Interactive Demo
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="hover:text-white transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link to="/session/new" className="hover:text-white transition-colors">
                  Start Live Session
                </Link>
              </li>
              <li>
                <Link to="/onboarding" className="hover:text-white transition-colors">
                  Sensory Setup Wizard
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-white font-semibold text-sm mb-3">Assurance & Ethics</h2>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <Link to="/privacy" className="hover:text-white transition-colors">
                  Privacy & Data Retention
                </Link>
              </li>
              <li>
                <Link to="/accessibility" className="hover:text-white transition-colors">
                  Accessibility Statement
                </Link>
              </li>
              <li>
                <span className="text-slate-400 text-xs block">
                  Zero biometric identity recognition. No face recognition or voiceprints.
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-900 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>© {new Date().getFullYear()} SenseWeave. Real-time multimodal environmental awareness.</p>
          <p className="flex items-center space-x-1">
            <span>Built for human inclusion and dignity</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" aria-hidden="true" />
          </p>
        </div>
      </div>
    </footer>
  );
};
