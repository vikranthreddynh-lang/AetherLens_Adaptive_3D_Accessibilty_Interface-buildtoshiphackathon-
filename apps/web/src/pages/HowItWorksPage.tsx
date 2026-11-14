import React from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  Radio,
  Cpu,
  Layers,
  Sliders,
  ShieldAlert,
  ArrowRight,
  Eye,
  Volume2,
  Smartphone,
  Terminal,
} from 'lucide-react';

export const HowItWorksPage: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Title */}
      <div className="space-y-4 text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-sense-950 text-sense-400 border border-sense-800 text-xs font-semibold">
          <Cpu className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Architecture & Multimodal Processing</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
          How SenseWeave Works
        </h1>
        <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
          Understanding dynamic physical environments requires more than identifying static objects or transcribing speech. Discover the step-by-step pipeline behind the Live Context Weave Engine.
        </p>
      </div>

      {/* 4-Step Pipeline */}
      <div className="space-y-8">
        <h2 className="text-xs font-bold text-sense-400 uppercase tracking-widest text-center">
          The 4-Stage Multimodal Processing Pipeline
        </h2>

        <div className="space-y-6">
          {/* Step 1 */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row gap-6 items-start">
            <div className="w-12 h-12 rounded-xl bg-sense-500/10 text-sense-400 flex items-center justify-center font-bold text-xl shrink-0">
              1
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-white">
                Authorized Media Ingestion & On-Device Feature Sampling
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                With explicit user consent, authorized browser microphone audio and camera frames are captured. To preserve bandwidth and prevent memory buildup, visual frames are sampled adaptively at 0.5–1 fps. Simultaneously, an on-device optical detector analyzes pixel differential vectors to immediately identify candidate gestures like raised hands or pointing extensions.
              </p>
              <div className="flex flex-wrap gap-2 pt-2 text-xs text-slate-400 font-mono">
                <span className="bg-slate-950 px-2.5 py-1 rounded border border-slate-800">Sampled Frames (&lt;100KB)</span>
                <span className="bg-slate-950 px-2.5 py-1 rounded border border-slate-800">PCM Audio Stream</span>
                <span className="bg-slate-950 px-2.5 py-1 rounded border border-slate-800">Zero Raw Media Storage</span>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row gap-6 items-start">
            <div className="w-12 h-12 rounded-xl bg-sense-500/10 text-sense-400 flex items-center justify-center font-bold text-xl shrink-0">
              2
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-white">
                Multimodal Live Processing & Strict JSON Event Detection
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                The backend securely streams multimodal input to Google Gemini. Gemini detects observable physical occurrences—distinguishing direct observations from interpretations. The model output is strictly constrained to our JSON event schema and validated via Zod on the server.
              </p>
              <div className="flex flex-wrap gap-2 pt-2 text-xs text-slate-400 font-mono">
                <span className="bg-slate-950 px-2.5 py-1 rounded border border-slate-800">Gemini Live API</span>
                <span className="bg-slate-950 px-2.5 py-1 rounded border border-slate-800">Strict Zod Validation</span>
                <span className="bg-slate-950 px-2.5 py-1 rounded border border-slate-800">Anonymous Speaker Labels</span>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row gap-6 items-start">
            <div className="w-12 h-12 rounded-xl bg-sense-500/10 text-sense-400 flex items-center justify-center font-bold text-xl shrink-0">
              3
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-white">
                The Live Context Weave Engine: Normalization, Deduplication & Temporal Graph
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Rather than treating detections independently, the Weave Engine assigns authoritative timestamps, links turn transitions, detects overlapping speech harmonics, and suppresses repetitive notifications for unchanged states using a sliding temporal deduplication window.
              </p>
              <div className="flex flex-wrap gap-2 pt-2 text-xs text-slate-400 font-mono">
                <span className="bg-slate-950 px-2.5 py-1 rounded border border-slate-800">Turn-Taking Transition Logic</span>
                <span className="bg-slate-950 px-2.5 py-1 rounded border border-slate-800">Sliding Window Deduplication</span>
                <span className="bg-slate-950 px-2.5 py-1 rounded border border-slate-800">Certainty & Priority Grading</span>
              </div>
            </div>
          </div>

          {/* Step 4 */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row gap-6 items-start">
            <div className="w-12 h-12 rounded-xl bg-sense-500/10 text-sense-400 flex items-center justify-center font-bold text-xl shrink-0">
              4
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-white">
                Deterministic Sensory Cue Rendering
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                The validated event is converted into the user's preferred sensory combination. Vibration pulses are triggered via the Web Vibration API, screen-reader live regions are updated via semantic HTML, Braille terminals receive tokenized bracketed strings, and spoken descriptions play through non-overlapping audio queues.
              </p>
              <div className="flex flex-wrap gap-2 pt-2 text-xs text-slate-400 font-mono">
                <span className="bg-slate-950 px-2.5 py-1 rounded border border-slate-800">Web Vibration API</span>
                <span className="bg-slate-950 px-2.5 py-1 rounded border border-slate-800">Web Audio Stereo Panning</span>
                <span className="bg-slate-950 px-2.5 py-1 rounded border border-slate-800">Refreshable Braille Format</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Limitations Section */}
      <div className="bg-slate-900 border-2 border-slate-700 rounded-3xl p-6 sm:p-10 space-y-4">
        <div className="flex items-center space-x-3 text-amber-400">
          <ShieldAlert className="w-6 h-6 shrink-0" aria-hidden="true" />
          <h2 className="text-xl font-bold text-white">Hardware & Sensory Limitations</h2>
        </div>
        <p className="text-sm text-slate-300 leading-relaxed">
          SenseWeave maintains high transparency regarding physical device capabilities:
        </p>
        <ul className="list-disc list-inside space-y-2 text-xs sm:text-sm text-slate-300 pl-2">
          <li>
            <strong>Phone Vibration Motor:</strong> A standard mobile phone vibration motor is a single inertial actuator, not a directional tactile array. It encodes information through temporal rhythm patterns, not physical spatial direction.
          </li>
          <li>
            <strong>Camera Field of View:</strong> Monocular camera frames cannot reliably infer physical distance or 3D depth without dedicated depth sensors. Spatial coordinates are reported as camera-relative (camera-left, camera-center, camera-right) or marked as unknown.
          </li>
          <li>
            <strong>Interruption Gaps:</strong> When network or camera permissions are temporarily paused or disconnected, SenseWeave explicitly marks observation gaps and never claims continuous monitoring occurred during disconnections.
          </li>
        </ul>
      </div>

      {/* Navigation */}
      <div className="flex justify-center pt-4">
        <Link
          to="/demo"
          className="px-6 py-3.5 rounded-xl bg-sense-600 hover:bg-sense-500 text-white font-bold text-sm flex items-center space-x-2"
        >
          <span>Try the Interactive Demo</span>
          <ArrowRight className="w-4 h-4" aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
};
