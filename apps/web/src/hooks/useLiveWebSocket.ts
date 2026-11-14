import { useEffect, useRef, useState, useCallback } from 'react';
import {
  WsServerMessage,
  WsServerMessageSchema,
  EnvironmentalEvent,
  RenderedSensoryCue,
  AccessibilityPreferences,
  LocalVisualObservation,
} from '@senseweave/shared';
import { apiClient } from '../lib/api/client.js';

export type ConnectionState = 'idle' | 'connecting' | 'connected' | 'reconnecting' | 'disconnected' | 'ended' | 'error';

export interface UseLiveWebSocketOptions {
  sessionId: string;
  ticket: string;
  wsUrl?: string;
  preferences: AccessibilityPreferences;
  onEvent?: (event: EnvironmentalEvent) => void;
  onCue?: (cue: RenderedSensoryCue) => void;
  onStatusChange?: (status: { state: string; elapsedMs: number; cameraActive: boolean; micActive: boolean }) => void;
  onSessionEnded?: (reason: string, eventCount: number) => void;
  onError?: (err: Error) => void;
}

export function useLiveWebSocket(options: UseLiveWebSocketOptions) {
  const {
    sessionId,
    ticket,
    wsUrl = '',
    preferences,
    onEvent,
    onCue,
    onStatusChange,
    onSessionEnded,
    onError,
  } = options;

  const [connectionState, setConnectionState] = useState<ConnectionState>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [isSessionPaused, setIsSessionPaused] = useState(false);

  const socketRef = useRef<WebSocket | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const isManuallyClosedRef = useRef(false);
  const currentTicketRef = useRef(ticket);
  currentTicketRef.current = ticket || currentTicketRef.current;

  // Keep latest callbacks in refs so connect doesn't recreate when parent re-renders
  const onEventRef = useRef(onEvent);
  const onCueRef = useRef(onCue);
  const onStatusChangeRef = useRef(onStatusChange);
  const onSessionEndedRef = useRef(onSessionEnded);
  const onErrorRef = useRef(onError);
  const preferencesRef = useRef(preferences);

  onEventRef.current = onEvent;
  onCueRef.current = onCue;
  onStatusChangeRef.current = onStatusChange;
  onSessionEndedRef.current = onSessionEnded;
  onErrorRef.current = onError;
  preferencesRef.current = preferences;

  const connect = useCallback((overrideTicket?: string) => {
    const activeTicket = overrideTicket || currentTicketRef.current;
    if (!sessionId || !activeTicket) return;

    setConnectionState((prev) => (prev === 'idle' ? 'connecting' : prev));
    setErrorMessage(null);

    // Build absolute WS URL
    let fullWsUrl = '';
    if (wsUrl) {
      const sep = wsUrl.includes('?') ? '&' : '?';
      fullWsUrl = `${wsUrl}${sep}ticket=${encodeURIComponent(activeTicket)}`;
    } else {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = window.location.host;
      fullWsUrl = `${protocol}//${host}/api/v1/live?ticket=${encodeURIComponent(activeTicket)}`;
    }

    const ws = new WebSocket(fullWsUrl);
    socketRef.current = ws;

    ws.onopen = () => {
      setConnectionState('connected');
      reconnectAttemptsRef.current = 0;
      setErrorMessage(null);

      // Send initial preferences update
      ws.send(
        JSON.stringify({
          type: 'preferences.update',
          payload: { preferences: preferencesRef.current },
        })
      );
    };

    ws.onmessage = (event) => {
      try {
        const rawJson = JSON.parse(event.data);
        const parsed = WsServerMessageSchema.safeParse(rawJson);

        if (!parsed.success) {
          return;
        }

        const msg: WsServerMessage = parsed.data;

        switch (msg.type) {
          case 'session.ready':
            setConnectionState('connected');
            break;

          case 'session.status':
            setElapsedMs(msg.payload.elapsedMs);
            setIsSessionPaused(msg.payload.state === 'paused');
            if (onStatusChangeRef.current) {
              onStatusChangeRef.current(msg.payload);
            }
            break;

          case 'environment.event':
            if (onEventRef.current) {
              onEventRef.current(msg.payload.event);
            }
            break;

          case 'environment.cue':
            if (onCueRef.current) {
              onCueRef.current(msg.payload.cue);
            }
            break;

          case 'session.reconnecting':
            setConnectionState('reconnecting');
            break;

          case 'session.error':
            setErrorMessage(msg.payload.message);
            if (onErrorRef.current) onErrorRef.current(new Error(msg.payload.message));
            break;

          case 'session.ended':
            setConnectionState('ended');
            if (onSessionEndedRef.current) {
              onSessionEndedRef.current(msg.payload.reason, msg.payload.finalEventCount);
            }
            break;

          default:
            break;
        }
      } catch {
        // Parse error
      }
    };

    ws.onclose = () => {
      if (isManuallyClosedRef.current) {
        setConnectionState('ended');
        return;
      }

      // Try automatic ticket refresh & reconnect if unexpected close occurs
      if (reconnectAttemptsRef.current < 2) {
        reconnectAttemptsRef.current += 1;
        setConnectionState('reconnecting');
        apiClient
          .refreshTicket(sessionId)
          .then((newTicket) => {
            currentTicketRef.current = newTicket;
            connect(newTicket);
          })
          .catch(() => {
            setConnectionState('disconnected');
          });
      } else {
        setConnectionState('disconnected');
      }
    };

    ws.onerror = () => {
      // If we haven't exhausted reconnects, attempt ticket refresh
      if (reconnectAttemptsRef.current < 2 && !isManuallyClosedRef.current) {
        reconnectAttemptsRef.current += 1;
        setConnectionState('reconnecting');
        apiClient
          .refreshTicket(sessionId)
          .then((newTicket) => {
            currentTicketRef.current = newTicket;
            connect(newTicket);
          })
          .catch((err) => {
            setConnectionState('error');
            setErrorMessage((err as Error).message || 'WebSocket connection encountered an error.');
          });
      } else {
        setConnectionState('error');
        setErrorMessage('WebSocket connection encountered an error. Click Reconnect to try again.');
      }
    };
  }, [sessionId, wsUrl]);

  // Connect on mount
  useEffect(() => {
    isManuallyClosedRef.current = false;
    connect();

    return () => {
      isManuallyClosedRef.current = true;
      if (socketRef.current) {
        socketRef.current.close(1000, 'Component unmounted');
        socketRef.current = null;
      }
    };
  }, [connect]);

  // Sync preference updates over open socket without reconnecting
  useEffect(() => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(
        JSON.stringify({
          type: 'preferences.update',
          payload: { preferences },
        })
      );
    }
  }, [preferences]);

  const send = useCallback((message: object) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(message));
    }
  }, []);

  const pause = useCallback(() => {
    send({ type: 'session.pause', payload: {} });
    setIsSessionPaused(true);
  }, [send]);

  const resume = useCallback(() => {
    send({ type: 'session.resume', payload: {} });
    setIsSessionPaused(false);
  }, [send]);

  const stop = useCallback(() => {
    isManuallyClosedRef.current = true;
    send({ type: 'session.stop', payload: {} });
    setConnectionState('ended');
    if (socketRef.current) {
      socketRef.current.close(1000, 'User stopped session');
    }
  }, [send]);

  const toggleCamera = useCallback((enable: boolean) => {
    send({ type: enable ? 'camera.enable' : 'camera.disable', payload: {} });
  }, [send]);

  const toggleMic = useCallback((enable: boolean) => {
    send({ type: enable ? 'microphone.enable' : 'microphone.disable', payload: {} });
  }, [send]);

  const sendVideoFrame = useCallback(
    (data: string, mimeType = 'image/jpeg') => {
      send({
        type: 'media.video_frame',
        payload: {
          data,
          mimeType,
          timestamp: Date.now(),
        },
      });
    },
    [send]
  );

  const sendAudioChunk = useCallback(
    (data: string, mimeType = 'audio/pcm;rate=16000') => {
      send({
        type: 'media.audio_chunk',
        payload: {
          data,
          mimeType,
          sampleRate: 16000,
          timestamp: Date.now(),
        },
      });
    },
    [send]
  );

  const sendVisualObservation = useCallback(
    (observation: LocalVisualObservation) => {
      send({
        type: 'client.visual_observation',
        payload: { observation },
      });
    },
    [send]
  );

  return {
    connectionState,
    errorMessage,
    elapsedMs,
    isSessionPaused,
    pause,
    resume,
    stop,
    toggleCamera,
    toggleMic,
    sendVideoFrame,
    sendAudioChunk,
    sendVisualObservation,
    reconnect: () => connect(),
  };
}
