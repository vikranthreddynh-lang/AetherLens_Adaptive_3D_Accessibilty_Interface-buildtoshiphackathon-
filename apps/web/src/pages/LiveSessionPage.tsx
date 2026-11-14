import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import {
  EnvironmentalEvent,
  RenderedSensoryCue,
  EnvironmentType,
} from '@senseweave/shared';
import { useLiveWebSocket } from '../hooks/useLiveWebSocket.js';
import { useAccessibilityPreferences } from '../hooks/useAccessibilityPreferences.js';
import { MediaDeviceService } from '../lib/media/mediaDevices.js';
import { VideoSampler } from '../lib/media/videoSampler.js';
import { LocalVisualDetector } from '../lib/media/localVisualDetector.js';
import { HapticEngine } from '../lib/accessibility/hapticEngine.js';
import { AudioEngine } from '../lib/audio/audioEngine.js';
import { announceToScreenReader } from '../components/accessibility/LiveRegion.js';
import { EventCard } from '../features/live-session/EventCard.js';
import { BrailleDisplayBox } from '../components/accessibility/BrailleDisplayBox.js';
import { SpeakerStatusWidget } from '../features/live-session/SpeakerStatusWidget.js';
import { LiveControlToolbar } from '../features/live-session/LiveControlToolbar.js';
import { SessionFeedbackModal } from '../features/live-session/SessionFeedbackModal.js';
import {
  Radio,
  Clock,
  Sparkles,
  ShieldAlert,
  Sliders,
  Volume2,
  Smartphone,
  Eye,
} from 'lucide-react';

export const LiveSessionPage: React.FC = () => {
  const { id: sessionId = '' } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const ticket = searchParams.get('ticket') || '';
  const environmentType = (searchParams.get('env') as EnvironmentType) || 'group_discussion';
  const initialCam = searchParams.get('cam') !== 'false';
  const initialMic = searchParams.get('mic') !== 'false';

  const { preferences } = useAccessibilityPreferences();

  // Session state
  const [cameraActive, setCameraActive] = useState(initialCam);
  const [micActive, setMicActive] = useState(initialMic);
  const [quietMode, setQuietMode] = useState(preferences.quietMode);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  // Event stream state
  const [events, setEvents] = useState<EnvironmentalEvent[]>([]);
  const [latestCue, setLatestCue] = useState<RenderedSensoryCue | null>(null);
  const [activeSpeaker, setActiveSpeaker] = useState<string | null>(null);
  const [isOverlapping, setIsOverlapping] = useState(false);
  const [recentSpeakers, setRecentSpeakers] = useState<string[]>([]);

  // Local media refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const videoSamplerRef = useRef<VideoSampler | null>(null);
  const visualDetectorRef = useRef<LocalVisualDetector | null>(null);
  const samplingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Audio capture refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const audioProcessorRef = useRef<ScriptProcessorNode | null>(null);

  // Sensory dispatch callback
  const handleIncomingCue = useCallback(
    (cue: RenderedSensoryCue) => {
      setLatestCue(cue);

      // 1. Tactile Haptics
      if (preferences.outputs.haptics) {
        HapticEngine.trigger(cue.renderedCue.hapticPattern);
      }

      // 2. Audio Earcon & Speech Description
      if (preferences.outputs.audio && !quietMode) {
        const pan = preferences.outputs.spatialAudio ? cue.renderedCue.spatialAudio.pan : 0;
        AudioEngine.playEarcon(
          cue.renderedCue.priority === 'high' ? 'overlap' : 'turn',
          pan
        );
        AudioEngine.speak(cue.renderedCue.audioText, {
          speechRate: preferences.speechRate,
          quietMode,
        });
      }

      // 3. Screen Reader Live Region
      announceToScreenReader(cue.renderedCue.screenReaderAnnouncement, cue.renderedCue.priority);
    },
    [preferences, quietMode]
  );

  const handleIncomingEvent = useCallback((event: EnvironmentalEvent) => {
    setEvents((prev) => [event, ...prev]);

    if (event.eventType === 'speech_activity' && event.speakerLabel) {
      setActiveSpeaker(event.speakerLabel);
      setRecentSpeakers((prev) => {
        const last = prev[prev.length - 1];
        return last === event.speakerLabel ? prev : [...prev, event.speakerLabel!];
      });
      setIsOverlapping(false);
    } else if (event.eventType === 'speaker_turn' && event.speakerLabel) {
      setActiveSpeaker(event.speakerLabel);
      setRecentSpeakers((prev) => [...prev, event.speakerLabel!]);
      setIsOverlapping(false);
    } else if (event.eventType === 'overlapping_speech') {
      setIsOverlapping(true);
    }
  }, []);

  const handleSessionEnded = useCallback(
    (_reason: string) => {
      // Clean up local media
      MediaDeviceService.stopStream(streamRef.current);
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
      }
      navigate(`/session/${sessionId}/recap`);
    },
    [navigate, sessionId]
  );

  // Initialize WebSocket connection
  const {
    connectionState,
    errorMessage,
    elapsedMs,
    isSessionPaused,
    pause,
    resume,
    stop,
    toggleCamera: wsToggleCam,
    toggleMic: wsToggleMic,
    sendVideoFrame,
    sendAudioChunk,
    sendVisualObservation,
    reconnect,
  } = useLiveWebSocket({
    sessionId,
    ticket,
    wsUrl: import.meta.env.VITE_WS_BASE_URL || '',
    preferences,
    onEvent: handleIncomingEvent,
    onCue: handleIncomingCue,
    onSessionEnded: handleSessionEnded,
  });

  const connectionStateRef = useRef(connectionState);
  const isSessionPausedRef = useRef(isSessionPaused);
  connectionStateRef.current = connectionState;
  isSessionPausedRef.current = isSessionPaused;

  // Start media devices on mount
  useEffect(() => {
    videoSamplerRef.current = new VideoSampler(480, 360);
    visualDetectorRef.current = new LocalVisualDetector();

    MediaDeviceService.requestStream({
      audio: micActive,
      video: cameraActive,
    })
      .then((stream) => {
        streamRef.current = stream;

        // Video track setup
        if (cameraActive && videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }

        // Audio processing setup (raw PCM sampling)
        if (micActive) {
          try {
            const AudioContextClass =
              window.AudioContext ||
              (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
            const actx = new AudioContextClass({ sampleRate: 16000 });
            audioContextRef.current = actx;
            const source = actx.createMediaStreamSource(stream);
            audioSourceRef.current = source;

            // Simple ScriptProcessorNode for streaming PCM
            const processor = actx.createScriptProcessor(4096, 1, 1);
            audioProcessorRef.current = processor;

            processor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              // Convert Float32 to 16-bit PCM buffer
              const pcm16 = new Int16Array(inputData.length);
              for (let i = 0; i < inputData.length; i++) {
                const s = Math.max(-1, Math.min(1, inputData[i]));
                pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
              }
              // Base64 encode for WebSocket streaming
              // Uint8Array byte buffer
              const bytes = new Uint8Array(pcm16.buffer);
              let binary = '';
              for (let i = 0; i < bytes.length; i++) {
                binary += String.fromCharCode(bytes[i]);
              }
              const base64Chunk = btoa(binary);

              // Send audio chunks only while the live connection is active.
              if (connectionStateRef.current === 'connected' && !isSessionPausedRef.current) {
                sendAudioChunk(base64Chunk);
              }
            };

            source.connect(processor);
            processor.connect(actx.destination);
          } catch {
            // AudioWorklet / context policy
          }
        }

        // Video frame grabber loop (1 frame every 1200ms)
        samplingIntervalRef.current = setInterval(() => {
          if (
            cameraActive &&
            videoRef.current &&
            videoSamplerRef.current &&
            connectionStateRef.current === 'connected' &&
            !isSessionPausedRef.current
          ) {
            const sample = videoSamplerRef.current.sampleFrame(videoRef.current);
            if (sample) {
              sendVideoFrame(sample.data, sample.mimeType);

              // Local optical gesture analysis
              if (sample.imageData && visualDetectorRef.current) {
                const localObs = visualDetectorRef.current.processFrame(sample.imageData);
                if (localObs) {
                  sendVisualObservation(localObs);
                }
              }
            }
          }
        }, 1200);
      })
      .catch((err) => {
        announceToScreenReader('Camera or microphone access failed. Please verify browser permissions.', 'high');
      });

    return () => {
      if (samplingIntervalRef.current) clearInterval(samplingIntervalRef.current);
      MediaDeviceService.stopStream(streamRef.current);
      if (audioContextRef.current) audioContextRef.current.close().catch(() => {});
    };
  }, [cameraActive, micActive, sendVideoFrame, sendAudioChunk, sendVisualObservation]);

  const handleToggleCam = () => {
    const next = !cameraActive;
    setCameraActive(next);
    wsToggleCam(next);
    if (streamRef.current) {
      streamRef.current.getVideoTracks().forEach((t) => (t.enabled = next));
    }
  };

  const handleToggleMic = () => {
    const next = !micActive;
    setMicActive(next);
    wsToggleMic(next);
    if (streamRef.current) {
      streamRef.current.getAudioTracks().forEach((t) => (t.enabled = next));
    }
  };

  const handleTogglePause = () => {
    if (isSessionPaused) {
      resume();
    } else {
      pause();
    }
  };

  const formatElapsed = (ms: number) => {
    const totalSecs = Math.floor(ms / 1000);
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Status & Elapsed Time Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Radio
              className={`w-6 h-6 ${
                connectionState === 'connected' && !isSessionPaused
                  ? 'text-emerald-400 animate-pulse'
                  : 'text-amber-400'
              }`}
              aria-hidden="true"
            />
            <span
              className={`absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full ${
                connectionState === 'connected' && !isSessionPaused
                  ? 'bg-emerald-400'
                  : 'bg-amber-400'
              }`}
            />
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-base sm:text-lg font-bold text-white">
                Live Environmental Awareness
              </h1>
              <span className="text-xs px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 capitalize font-mono">
                {environmentType.replace(/_/g, ' ')}
              </span>
            </div>
            <div className="flex items-center space-x-2 text-xs text-slate-400">
              <span className="capitalize">{connectionState}</span>
              {isSessionPaused && <span className="text-amber-400 font-bold">• PAUSED</span>}
            </div>
          </div>
        </div>

        {/* Elapsed Timer & Stop Shortcut */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1.5 text-white font-mono text-sm bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
            <Clock className="w-4 h-4 text-slate-400" aria-hidden="true" />
            <span>{formatElapsed(elapsedMs)}</span>
          </div>
        </div>
      </div>

      {errorMessage && (
        <div
          role="alert"
          className="p-3.5 rounded-xl bg-amber-950/60 border border-amber-800 text-amber-200 text-xs flex items-center justify-between"
        >
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" aria-hidden="true" />
            <span>{errorMessage}</span>
          </div>
          <button
            type="button"
            onClick={reconnect}
            className="px-2.5 py-1 rounded-lg bg-amber-800 hover:bg-amber-700 text-white font-medium text-xs transition"
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* Floating Live Control Toolbar */}
      <LiveControlToolbar
        cameraActive={cameraActive}
        micActive={micActive}
        isPaused={isSessionPaused}
        quietMode={quietMode}
        onToggleCamera={handleToggleCam}
        onToggleMic={handleToggleMic}
        onTogglePause={handleTogglePause}
        onToggleQuietMode={() => setQuietMode(!quietMode)}
        onStop={stop}
        onOpenFeedback={() => setShowFeedbackModal(true)}
      />

      {/* Active Cue Hero Announcement Card */}
      {latestCue && (
        <section
          role="region"
          aria-label="Latest Verified Environmental Cue"
          className="bg-gradient-to-r from-slate-900 via-slate-900 to-sense-950 border-2 border-sense-400/80 rounded-2xl p-5 shadow-2xl relative overflow-hidden"
        >
          <div className="flex items-center justify-between text-xs text-sense-300 font-bold uppercase tracking-wider mb-2">
            <div className="flex items-center space-x-1.5">
              <Sparkles className="w-4 h-4 text-sense-400" aria-hidden="true" />
              <span>Active Sensory Cue</span>
            </div>
            <span>{new Date(latestCue.observedAt).toLocaleTimeString()}</span>
          </div>

          <h2 className="text-lg sm:text-2xl font-bold text-white mb-2 leading-snug">
            {latestCue.renderedCue.accessibleText}
          </h2>

          <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-slate-300">
            <span className="bg-slate-950 px-2.5 py-1 rounded-md border border-slate-800 font-mono">
              Haptic: {latestCue.renderedCue.hapticPattern.replace(/_/g, ' ')}
            </span>
            {latestCue.renderedCue.spatialAudio.enabled && (
              <span className="bg-slate-950 px-2.5 py-1 rounded-md border border-slate-800">
                Spatial Pan: {(latestCue.renderedCue.spatialAudio.pan * 100).toFixed(0)}%
              </span>
            )}
            <span className="text-slate-400">
              Modality: {latestCue.sourceModalities.join(' + ')}
            </span>
          </div>
        </section>
      )}

      {/* Main Live Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Dynamics, Braille & Camera Stream */}
        <div className="lg:col-span-1 space-y-6">
          <SpeakerStatusWidget
            currentSpeaker={activeSpeaker}
            isOverlapping={isOverlapping}
            recentSpeakers={recentSpeakers}
          />

          {preferences.outputs.brailleCompatible && (
            <BrailleDisplayBox
              brailleText={
                latestCue
                  ? latestCue.renderedCue.brailleText
                  : '[IDLE] Monitoring physical environment for signals...'
              }
              sourceModalities={latestCue?.sourceModalities}
              observedAt={latestCue?.observedAt}
              priority={latestCue?.renderedCue.priority}
            />
          )}

          {/* Local Camera Preview Box */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-300 font-bold uppercase tracking-wider">
              <span>Sensor Feed (Sampled)</span>
              <span className={cameraActive ? 'text-emerald-400' : 'text-slate-400'}>
                {cameraActive ? 'Active (~1 fps)' : 'Off'}
              </span>
            </div>

            <div className="relative aspect-video bg-black rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover ${cameraActive ? 'block' : 'hidden'}`}
              />
              {!cameraActive && (
                <span className="text-xs text-slate-400 p-2 text-center">
                  Camera disabled (Audio-only monitoring)
                </span>
              )}
            </div>

            <p className="text-[11px] text-slate-400">
              Raw frames are sampled in local memory and analyzed for optical gestures without storing footage.
            </p>
          </div>
        </div>

        {/* Right Column: Chronological Event Timeline */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <span>Chronological Event Timeline</span>
              <span className="text-xs font-normal text-slate-400">
                ({events.length} observable events)
              </span>
            </h2>
          </div>

          <div className="space-y-3">
            {events.length > 0 ? (
              events.map((evt, idx) => (
                <EventCard key={evt.id} event={evt} isLatest={idx === 0} />
              ))
            ) : (
              <div className="text-center py-20 bg-slate-900/40 border border-slate-800 rounded-2xl text-slate-400 space-y-3">
                <Radio className="w-8 h-8 text-sense-500 animate-pulse mx-auto" aria-hidden="true" />
                <p className="text-sm font-semibold text-white">
                  Live Context Weave Engine is Listening
                </p>
                <p className="text-xs max-w-sm mx-auto">
                  Observable events—speech turns, overlapping voices, hand raises, and announcements—will populate this timeline automatically.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {showFeedbackModal && (
        <SessionFeedbackModal
          sessionId={sessionId}
          onClose={() => setShowFeedbackModal(false)}
        />
      )}
    </div>
  );
};
