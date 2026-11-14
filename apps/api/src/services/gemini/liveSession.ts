import {
  ModelDetectedEvent,
  ModelEventBatchResponseSchema,
  EnvironmentType,
} from '@senseweave/shared';
import { getGeminiClient, SENSEWEAVE_SYSTEM_PROMPT } from './client.js';
import { env } from '../../config/env.js';
import { logger } from '../../utils/logger.js';

export interface GeminiSessionOptions {
  sessionId: string;
  environmentType: EnvironmentType;
  selectedCategories?: string[];
  speechTranscriptionEnabled?: boolean;
  onEventsDetected: (events: ModelDetectedEvent[]) => void;
  onError: (error: Error, fatal: boolean) => void;
}

export class GeminiLiveBridgeSession {
  private readonly sessionId: string;
  private environmentType: EnvironmentType;
  private selectedCategories: string[];
  private onEventsDetected: (events: ModelDetectedEvent[]) => void;
  private onError: (error: Error, fatal: boolean) => void;

  private isRunning = false;
  private isPaused = false;
  private cameraEnabled = true;
  private micEnabled = true;

  // Bounded media buffer: only keeps the most recent visual frame and audio chunk
  private latestVideoFrame: { data: string; mimeType: string; timestamp: number } | null = null;
  private latestAudioChunk: { data: string; mimeType: string; timestamp: number } | null = null;
  private localCuesBuffer: string[] = [];

  private processingInterval: NodeJS.Timeout | null = null;
  private isCurrentlyInferring = false;
  private consecutiveErrors = 0;

  constructor(options: GeminiSessionOptions) {
    this.sessionId = options.sessionId;
    this.environmentType = options.environmentType;
    this.selectedCategories = options.selectedCategories || [];
    this.onEventsDetected = options.onEventsDetected;
    this.onError = options.onError;
  }

  public start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.isPaused = false;
    logger.info('Gemini Live session bridge started', { sessionId: this.sessionId });

    // Processing loop: evaluate multimodal cues every ~2.5 seconds
    this.processingInterval = setInterval(() => {
      this.evaluateMultimodalCycle().catch((err) => {
        logger.error('Error during multimodal inference cycle', {
          sessionId: this.sessionId,
          error: (err as Error).message,
        });
      });
    }, 2500);
    if (this.processingInterval.unref) {
      this.processingInterval.unref();
    }
  }

  public pause() {
    this.isPaused = true;
    logger.info('Gemini Live session paused', { sessionId: this.sessionId });
  }

  public resume() {
    this.isPaused = false;
    logger.info('Gemini Live session resumed', { sessionId: this.sessionId });
  }

  public stop() {
    this.isRunning = false;
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = null;
    }
    this.latestVideoFrame = null;
    this.latestAudioChunk = null;
    this.localCuesBuffer = [];
    logger.info('Gemini Live session stopped', { sessionId: this.sessionId });
  }

  public pushVideoFrame(data: string, mimeType = 'image/jpeg', timestamp = Date.now()) {
    if (!this.isRunning || this.isPaused || !this.cameraEnabled) return;
    // Bounded buffer: Discard older frame, keep only fresh frame
    this.latestVideoFrame = { data, mimeType, timestamp };
  }

  public pushAudioChunk(data: string, mimeType = 'audio/pcm', timestamp = Date.now()) {
    if (!this.isRunning || this.isPaused || !this.micEnabled) return;
    this.latestAudioChunk = { data, mimeType, timestamp };
  }

  public pushLocalCue(cueDescription: string) {
    if (!this.isRunning || this.isPaused) return;
    this.localCuesBuffer.push(cueDescription);
    if (this.localCuesBuffer.length > 5) {
      this.localCuesBuffer.shift();
    }
  }

  public setCameraEnabled(enabled: boolean) {
    this.cameraEnabled = enabled;
    if (!enabled) this.latestVideoFrame = null;
  }

  public setMicrophoneEnabled(enabled: boolean) {
    this.micEnabled = enabled;
    if (!enabled) this.latestAudioChunk = null;
  }

  public updateEnvironmentType(type: EnvironmentType) {
    this.environmentType = type;
  }

  private async evaluateMultimodalCycle() {
    if (!this.isRunning || this.isPaused || this.isCurrentlyInferring) {
      return;
    }

    const frame = this.latestVideoFrame;
    const audio = this.latestAudioChunk;
    const localCues = [...this.localCuesBuffer];
    this.localCuesBuffer = []; // consume

    // If no media input available in this cycle, skip
    if (!frame && !audio && localCues.length === 0) {
      return;
    }

    this.isCurrentlyInferring = true;

    try {
      const ai = getGeminiClient();
      const parts: unknown[] = [];

      // Context instructions
      const promptContext = `Current environment profile: ${this.environmentType}.
Active modalities: ${frame ? 'camera (visual)' : 'no camera'}, ${audio ? 'microphone (audio)' : 'no microphone'}.
${localCues.length > 0 ? `Client-side visual observations: ${localCues.join('; ')}.` : ''}
Focus on observable signals: speaker activity, turn-taking transitions, speech overlap, hand raises, pointing, orientation shifts, announcements, and environmental sounds.
Identify approximate relative position (camera-left, camera-center, camera-right, unknown).
Never guess emotions, intentions, or identity. Return JSON with { "events": [...] } following the strict schema.`;

      parts.push({ text: promptContext });

      if (frame && this.cameraEnabled) {
        parts.push({
          inlineData: {
            mimeType: frame.mimeType,
            data: frame.data,
          },
        });
      }

      if (audio && this.micEnabled) {
        parts.push({
          inlineData: {
            mimeType: audio.mimeType,
            data: audio.data,
          },
        });
      }

      const candidateModels = [
        env.GEMINI_LIVE_MODEL,
        'gemini-3.8-flash',
        'gemini-flash-latest',
        'gemini-3.5-flash',
      ];

      let lastError: Error | null = null;
      let rawText = '';

      for (const model of candidateModels) {
        try {
          const response = await ai.models.generateContent({
            model,
            contents: parts as never,
            config: {
              systemInstruction: SENSEWEAVE_SYSTEM_PROMPT,
              responseMimeType: 'application/json',
              temperature: 0.2,
            },
          });

          rawText = response.text || '';
          if (rawText) break;
        } catch (mErr) {
          lastError = mErr as Error;
          logger.warn(`Model ${model} inference attempt failed, trying fallback if available`, {
            error: lastError.message,
          });
        }
      }

      if (!rawText && lastError) {
        throw lastError;
      }

      this.consecutiveErrors = 0;

      // Parse JSON safely
      let parsedJson: unknown;
      try {
        parsedJson = JSON.parse(rawText);
      } catch (pErr) {
        logger.warn('Gemini response was not valid JSON', {
          rawText: rawText.slice(0, 150),
          error: (pErr as Error).message,
        });
        return;
      }

      // Validate with Zod
      const validation = ModelEventBatchResponseSchema.safeParse(parsedJson);
      if (!validation.success) {
        logger.warn('Gemini output failed Zod validation', {
          issues: validation.error.issues,
        });
        return;
      }

      const validEvents = validation.data.events;
      if (validEvents.length > 0) {
        this.onEventsDetected(validEvents);
      }
    } catch (err: unknown) {
      this.consecutiveErrors += 1;
      const error = err as Error;
      logger.error('Gemini multimodal processing error', {
        sessionId: this.sessionId,
        consecutiveErrors: this.consecutiveErrors,
        error: error.message,
      });

      if (this.consecutiveErrors >= 5) {
        this.onError(new Error('Persistent AI connection error. Switching to resilient mode.'), false);
      }
    } finally {
      this.isCurrentlyInferring = false;
    }
  }
}
