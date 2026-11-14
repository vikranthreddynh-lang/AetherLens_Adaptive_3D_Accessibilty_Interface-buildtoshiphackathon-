import React from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  Radio,
  Eye,
  Sliders,
  Shield,
  Smartphone,
  Volume2,
  Terminal,
  Users,
  Compass,
  ArrowRight,
  ShieldAlert,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { TAGLINE } from '@senseweave/shared';

export const LandingPage: React.FC = () => {
  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-32 px-4 sm:px-6 lg:px-8 border-b border-slate-900 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
        <div className="max-w-5xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-sense-950 border border-sense-800 text-sense-300 text-xs sm:text-sm font-medium shadow-inner">
            <Sparkles className="w-4 h-4 text-sense-400" aria-hidden="true" />
            <span>AI-Powered Real-Time Environmental Awareness</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.1]">
            Experience the world through the signals that reach you.
          </h1>

          <p className="text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
            SenseWeave is an assistive environmental intelligence system designed primarily for DeafBlind, blind, and low-vision individuals. It translates simultaneous speech, speaker transitions, visible gestures, and surrounding cues into personalized tactile, audio, and Braille feedback.
          </p>

          {/* Call to Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              to="/session/new"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-sense-600 hover:bg-sense-500 text-white font-bold text-base transition-all shadow-xl shadow-sense-600/25 flex items-center justify-center space-x-2 focus:ring-4 focus:ring-sense-400"
            >
              <Radio className="w-5 h-5 animate-pulse" aria-hidden="true" />
              <span>Start Live Session</span>
            </Link>

            <Link
              to="/demo"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-semibold text-base transition-colors border border-slate-700 flex items-center justify-center space-x-2"
            >
              <Eye className="w-5 h-5 text-sense-400" aria-hidden="true" />
              <span>Explore Interactive Demo</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </div>

          <p className="text-xs text-slate-400">
            No account required to try the interactive demo or guest live session.
          </p>
        </div>
      </section>

      {/* Core Innovation: Live Context Weave Engine */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <h2 className="text-xs font-bold text-sense-400 uppercase tracking-widest">
            Core Technological Innovation
          </h2>
          <h3 className="text-3xl sm:text-4xl font-extrabold text-white">
            The Live Context Weave Engine
          </h3>
          <p className="text-slate-400 text-base">
            Conventional assistive tools identify static objects or transcribe speech in isolation. Dynamic environments happen simultaneously across speech, speaker changes, gestures, and sounds. The Weave Engine builds a continuous temporal timeline.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center">
              <Users className="w-6 h-6" aria-hidden="true" />
            </div>
            <h4 className="text-lg font-bold text-white">Conversational Dynamics</h4>
            <p className="text-sm text-slate-400 leading-relaxed">
              Tracks anonymous speaker turns (Speaker A, Speaker B), overlapping voices, and pauses without biometric identification or recording conversations.
            </p>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Compass className="w-6 h-6" aria-hidden="true" />
            </div>
            <h4 className="text-lg font-bold text-white">Observable Physical Cues</h4>
            <p className="text-sm text-slate-400 leading-relaxed">
              Detects visible hand raises, pointing towards shared screens, orientation changes, and door activity using on-device optical detection and Gemini multimodal analysis.
            </p>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <Sliders className="w-6 h-6" aria-hidden="true" />
            </div>
            <h4 className="text-lg font-bold text-white">Personalized Sensory Translation</h4>
            <p className="text-sm text-slate-400 leading-relaxed">
              Transforms the unified timeline into user-chosen modalities: short tactile vibrations, refreshable Braille pins, screen-reader live regions, or spoken descriptions.
            </p>
          </div>
        </div>
      </section>

      {/* Sensory Modalities Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 bg-slate-900/40 border border-slate-800 rounded-3xl space-y-8">
        <div className="max-w-3xl space-y-2">
          <h2 className="text-xs font-bold text-sense-400 uppercase tracking-widest">
            Personalized Sensory Feedback
          </h2>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
            Choose how you receive the world
          </h3>
          <p className="text-slate-400 text-sm">
            SenseWeave never asks users to disclose a disability or medical diagnosis. You select your sensory preferences and combine any output modes.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-950/80 border border-slate-800 p-5 rounded-2xl space-y-3">
            <Smartphone className="w-6 h-6 text-tactile-amber" aria-hidden="true" />
            <h4 className="font-bold text-white text-base">Tactile Haptics</h4>
            <p className="text-xs text-slate-400">
              Short distinct vibration rhythms encode transitions, overlaps, and priority signals directly to your hand.
            </p>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 p-5 rounded-2xl space-y-3">
            <Terminal className="w-6 h-6 text-emerald-400" aria-hidden="true" />
            <h4 className="font-bold text-white text-base">Refreshable Braille</h4>
            <p className="text-xs text-slate-400">
              Clean tokenized representations formatted specifically for 40-cell and 80-cell Braille displays.
            </p>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 p-5 rounded-2xl space-y-3">
            <Volume2 className="w-6 h-6 text-sky-400" aria-hidden="true" />
            <h4 className="font-bold text-white text-base">Audio Descriptions</h4>
            <p className="text-xs text-slate-400">
              Concise non-intrusive speech descriptions with adjustable speed and optional stereo spatial panning.
            </p>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 p-5 rounded-2xl space-y-3">
            <Eye className="w-6 h-6 text-rose-400" aria-hidden="true" />
            <h4 className="font-bold text-white text-base">High-Contrast Visual</h4>
            <p className="text-xs text-slate-400">
              A chronological visual timeline with explicit evidence certainty chips and source badges.
            </p>
          </div>
        </div>
      </section>

      {/* Critical Boundaries & Ethical Safety */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="bg-slate-900 border-2 border-slate-700 rounded-3xl p-6 sm:p-10 space-y-6">
          <div className="flex items-center space-x-3 text-amber-400">
            <ShieldAlert className="w-7 h-7 shrink-0" aria-hidden="true" />
            <h3 className="text-xl sm:text-2xl font-bold text-white">
              Critical Accuracy & Ethical Safety Boundaries
            </h3>
          </div>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            SenseWeave is engineered with strict human safety boundaries. We communicate observable facts rather than inventing social intentions.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm text-slate-300">
            <div className="flex items-start space-x-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" aria-hidden="true" />
              <span>
                <strong>No Mobility Claims:</strong> Does not replace a white cane or guide dog. Never gives road-crossing or hazardous navigation instructions.
              </span>
            </div>

            <div className="flex items-start space-x-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" aria-hidden="true" />
              <span>
                <strong>Zero Biometric Tracking:</strong> No facial recognition, voiceprints, or biometric profiling. Speakers are temporarily labeled Speaker A or B.
              </span>
            </div>

            <div className="flex items-start space-x-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" aria-hidden="true" />
              <span>
                <strong>Observable Language Only:</strong> Reports "A person raised one hand", never guesses "Someone wants to ask a question."
              </span>
            </div>

            <div className="flex items-start space-x-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" aria-hidden="true" />
              <span>
                <strong>Zero Raw Media Storage:</strong> Raw microphone audio and camera images are processed in-memory and never stored by default.
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="max-w-5xl mx-auto px-4 text-center space-y-6">
        <h2 className="text-3xl font-extrabold text-white">
          Ready to experience the Live Context Weave?
        </h2>
        <p className="text-slate-400 text-base max-w-2xl mx-auto">
          Try the full interactive simulator with synthetic environmental scenarios, or launch a live awareness session with your browser's camera and microphone.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            to="/demo"
            className="px-6 py-3.5 rounded-xl bg-sense-600 hover:bg-sense-500 text-white font-bold text-sm shadow-lg shadow-sense-600/20"
          >
            Launch Interactive Demo
          </Link>
          <Link
            to="/onboarding"
            className="px-6 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm border border-slate-700"
          >
            Configure Sensory Preferences
          </Link>
        </div>
      </section>
    </div>
  );
};
