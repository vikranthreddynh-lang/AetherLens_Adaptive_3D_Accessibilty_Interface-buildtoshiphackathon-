import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  EnvironmentType,
  ENVIRONMENT_PROFILES_INFO,
} from '@senseweave/shared';
import {
  Radio,
  Video,
  Mic,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Play,
  Sliders,
  Sparkles,
} from 'lucide-react';
import { MediaDeviceService, MediaDeviceItem } from '../lib/media/mediaDevices.js';
import { useAccessibilityPreferences } from '../hooks/useAccessibilityPreferences.js';
import { apiClient } from '../lib/api/client.js';

export const NewSessionPage: React.FC = () => {
  const navigate = useNavigate();
  const { preferences } = useAccessibilityPreferences();

  const [selectedEnv, setSelectedEnv] = useState<EnvironmentType>('group_discussion');
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [micEnabled, setMicEnabled] = useState(true);

  const [audioDevices, setAudioDevices] = useState<MediaDeviceItem[]>([]);
  const [videoDevices, setVideoDevices] = useState<MediaDeviceItem[]>([]);
  const [selectedAudioId, setSelectedAudioId] = useState<string>('');
  const [selectedVideoId, setSelectedVideoId] = useState<string>('');

  const [cameraPermissionGranted, setCameraPermissionGranted] = useState(false);
  const [micPermissionGranted, setMicPermissionGranted] = useState(false);
  const [consentConfirmed, setConsentConfirmed] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const videoPreviewRef = useRef<HTMLVideoElement | null>(null);
  const previewStreamRef = useRef<MediaStream | null>(null);

  // Load available devices on mount
  useEffect(() => {
    MediaDeviceService.listDevices().then(({ audioInputs, videoInputs }) => {
      setAudioDevices(audioInputs);
      setVideoDevices(videoInputs);
      if (audioInputs.length > 0) setSelectedAudioId(audioInputs[0].deviceId);
      if (videoInputs.length > 0) setSelectedVideoId(videoInputs[0].deviceId);
    });

    return () => {
      MediaDeviceService.stopStream(previewStreamRef.current);
    };
  }, []);

  const handleTestSensors = async () => {
    setErrorMsg(null);
    try {
      const stream = await MediaDeviceService.requestStream({
        audio: micEnabled ? (selectedAudioId ? { deviceId: selectedAudioId } : true) : false,
        video: cameraEnabled ? (selectedVideoId ? { deviceId: selectedVideoId } : true) : false,
      });

      previewStreamRef.current = stream;

      if (cameraEnabled && videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = stream;
        videoPreviewRef.current.play().catch(() => {});
        setCameraPermissionGranted(true);
      }

      if (micEnabled) {
        const audioTracks = stream.getAudioTracks();
        if (audioTracks.length > 0) {
          setMicPermissionGranted(true);
        }
      }

      // Re-enumerate to get full device labels
      const { audioInputs, videoInputs } = await MediaDeviceService.listDevices();
      setAudioDevices(audioInputs);
      setVideoDevices(videoInputs);
    } catch (err: unknown) {
      setErrorMsg(
        (err as Error).message || 'Failed to access camera/microphone. Please check browser permissions.'
      );
    }
  };

  const handleStartSession = async () => {
    if (!consentConfirmed) {
      setErrorMsg('Please review and check the required privacy consent before beginning.');
      return;
    }

    if (!cameraEnabled && !micEnabled) {
      setErrorMsg('At least one sensor input (Camera or Microphone) must be enabled.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const response = await apiClient.createLiveSession({
        environmentType: selectedEnv,
        enabledInputs: {
          audio: micEnabled,
          video: cameraEnabled,
        },
        outputPreferences: preferences,
        speechTranscriptionEnabled: false,
        sessionConsentVersion: 'v1.0',
      });

      // Stop pre-session preview stream before handing over to live page
      MediaDeviceService.stopStream(previewStreamRef.current);

      navigate(`/session/${response.sessionId}/live?ticket=${encodeURIComponent(response.ticket)}&env=${selectedEnv}&cam=${cameraEnabled}&mic=${micEnabled}`);
    } catch (err: unknown) {
      setErrorMsg((err as Error).message || 'Could not start live session.');
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <div>
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-sense-950 text-sense-400 border border-sense-800 text-xs font-semibold mb-2">
          <Radio className="w-3.5 h-3.5" aria-hidden="true" />
          <span>New Live Session</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
          Configure Environmental Monitoring
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Select the physical environment and authorized sensor inputs. Raw media is processed in-memory and never stored by default.
        </p>
      </div>

      {errorMsg && (
        <div
          role="alert"
          className="p-4 rounded-2xl bg-rose-950/60 border border-rose-800 text-rose-200 text-sm flex items-start space-x-3"
        >
          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <span className="font-bold block">Session Setup Notice</span>
            <span>{errorMsg}</span>
          </div>
        </div>
      )}

      {/* 1. Environment Profile */}
      <section className="space-y-4">
        <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider">
          1. Select Environment Profile
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {(Object.keys(ENVIRONMENT_PROFILES_INFO) as EnvironmentType[]).map((envKey) => {
            const profile = ENVIRONMENT_PROFILES_INFO[envKey];
            const isSelected = selectedEnv === envKey;
            return (
              <button
                key={envKey}
                type="button"
                onClick={() => setSelectedEnv(envKey)}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  isSelected
                    ? 'bg-sense-950/80 border-sense-400 ring-2 ring-sense-500/30'
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                }`}
                aria-pressed={isSelected}
              >
                <span className="font-bold text-white text-sm block mb-1">
                  {profile.label}
                </span>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {profile.description}
                </p>
              </button>
            );
          })}
        </div>
      </section>

      {/* 2. Sensor Permissions & Preview */}
      <section className="space-y-4">
        <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider">
          2. Authorize Sensor Inputs
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Camera Input */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <Video className="w-5 h-5 text-sense-400" aria-hidden="true" />
                <span className="font-bold text-white text-base">Camera (Visual)</span>
              </div>
              <input
                type="checkbox"
                checked={cameraEnabled}
                onChange={(e) => setCameraEnabled(e.target.checked)}
                className="w-5 h-5 accent-sense-500 rounded"
                aria-label="Enable Camera"
              />
            </div>

            <p className="text-xs text-slate-400">
              Captures sampled video frames for hand raising, pointing, and group orientation detection.
            </p>

            {cameraEnabled && (
              <div className="space-y-3">
                {videoDevices.length > 0 && (
                  <div>
                    <label htmlFor="video-select" className="text-xs font-semibold text-slate-400 block mb-1">
                      Camera Device:
                    </label>
                    <select
                      id="video-select"
                      value={selectedVideoId}
                      onChange={(e) => setSelectedVideoId(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white"
                    >
                      {videoDevices.map((d) => (
                        <option key={d.deviceId} value={d.deviceId}>
                          {d.label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="relative aspect-video bg-black rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center">
                  <video
                    ref={videoPreviewRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                  {!cameraPermissionGranted && (
                    <span className="text-xs text-slate-400 p-2 text-center">
                      Click "Test Sensors" to preview camera
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Microphone Input */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <Mic className="w-5 h-5 text-sense-400" aria-hidden="true" />
                <span className="font-bold text-white text-base">Microphone (Audio)</span>
              </div>
              <input
                type="checkbox"
                checked={micEnabled}
                onChange={(e) => setMicEnabled(e.target.checked)}
                className="w-5 h-5 accent-sense-500 rounded"
                aria-label="Enable Microphone"
              />
            </div>

            <p className="text-xs text-slate-400">
              Streams audio chunks for speaker transitions, overlapping voices, and environmental sounds.
            </p>

            {micEnabled && (
              <div className="space-y-3">
                {audioDevices.length > 0 && (
                  <div>
                    <label htmlFor="audio-select" className="text-xs font-semibold text-slate-400 block mb-1">
                      Microphone Device:
                    </label>
                    <select
                      id="audio-select"
                      value={selectedAudioId}
                      onChange={(e) => setSelectedAudioId(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white"
                    >
                      {audioDevices.map((d) => (
                        <option key={d.deviceId} value={d.deviceId}>
                          {d.label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Microphone Status</span>
                    <span className={micPermissionGranted ? 'text-emerald-400 font-bold' : 'text-slate-400'}>
                      {micPermissionGranted ? 'Ready' : 'Not Activated'}
                    </span>
                  </div>
                  <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-150 ${
                        micPermissionGranted ? 'w-2/3 bg-emerald-500' : 'w-0'
                      }`}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleTestSensors}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 flex items-center space-x-1.5"
          >
            <span>Test Sensors & Camera Preview</span>
          </button>
        </div>
      </section>

      {/* 3. Privacy Consent */}
      <section className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center space-x-2 text-white font-bold text-base">
          <ShieldCheck className="w-5 h-5 text-sense-400" aria-hidden="true" />
          <h2>3. Privacy & Processing Consent</h2>
        </div>

        <div className="text-xs text-slate-300 space-y-2 bg-slate-950/80 p-4 rounded-xl border border-slate-800/80 leading-relaxed">
          <p>
            • Authorized audio chunks and sampled camera frames will be processed in-memory by Google Gemini.
          </p>
          <p>
            • No raw audio recordings or camera images are persisted by default.
          </p>
          <p>
            • No facial recognition or voiceprints are performed. Speakers are given temporary session labels only.
          </p>
          <p>
            • You can stop media capture or pause monitoring at any instant during the session.
          </p>
        </div>

        <label className="flex items-start space-x-3 cursor-pointer pt-2">
          <input
            type="checkbox"
            checked={consentConfirmed}
            onChange={(e) => setConsentConfirmed(e.target.checked)}
            className="mt-1 w-5 h-5 accent-sense-500 rounded"
          />
          <span className="text-xs sm:text-sm font-semibold text-white">
            I understand and consent to the environmental processing described above.
          </span>
        </label>
      </section>

      {/* Start Button */}
      <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-xs text-slate-400">
          Selected feedback modes:{' '}
          {Object.entries(preferences.outputs)
            .filter(([, v]) => v)
            .map(([k]) => k)
            .join(', ') || 'Default accessible text'}
        </p>

        <button
          onClick={handleStartSession}
          disabled={isLoading || !consentConfirmed}
          className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-sense-600 hover:bg-sense-500 disabled:opacity-40 text-white font-bold text-base flex items-center justify-center space-x-2 transition-all shadow-xl shadow-sense-600/25"
        >
          {isLoading ? (
            <span>Initiating Connection...</span>
          ) : (
            <>
              <Play className="w-5 h-5 fill-white" aria-hidden="true" />
              <span>Begin Live Awareness Session</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
