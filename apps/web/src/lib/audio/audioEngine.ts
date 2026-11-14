export interface PlayAudioCueOptions {
  text?: string;
  spatialPan?: number; // -1 to 1
  enabledSpatialAudio?: boolean;
  speechRate?: number;
  quietMode?: boolean;
}

export class AudioEngine {
  private static audioCtx: AudioContext | null = null;
  private static currentUtterance: SpeechSynthesisUtterance | null = null;

  private static getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }
    return this.audioCtx;
  }

  /**
   * Synthesizes short pleasant acoustic cues with optional stereo spatialization.
   */
  public static playEarcon(type: 'turn' | 'alert' | 'overlap' | 'soft', pan = 0) {
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      // Spatial stereo panner if supported
      let panner: StereoPannerNode | null = null;
      if (ctx.createStereoPanner) {
        panner = ctx.createStereoPanner();
        panner.pan.setValueAtTime(Math.max(-1, Math.min(1, pan)), ctx.currentTime);
      }

      const now = ctx.currentTime;

      if (type === 'turn') {
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(660, now + 0.12);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        osc.start(now);
        osc.stop(now + 0.15);
      } else if (type === 'overlap') {
        osc.frequency.setValueAtTime(520, now);
        osc.frequency.setValueAtTime(620, now + 0.06);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
        osc.start(now);
        osc.stop(now + 0.18);
      } else if (type === 'alert') {
        osc.frequency.setValueAtTime(587.33, now); // D5
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
      } else {
        // Soft blip
        osc.frequency.setValueAtTime(330, now);
        gain.gain.setValueAtTime(0.04, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        osc.start(now);
        osc.stop(now + 0.08);
      }

      if (panner) {
        osc.connect(gain);
        gain.connect(panner);
        panner.connect(ctx.destination);
      } else {
        osc.connect(gain);
        gain.connect(ctx.destination);
      }
    } catch {
      // AudioContext policy catch
    }
  }

  /**
   * Speaks environmental descriptions using Web Speech API.
   */
  public static speak(text: string, options: PlayAudioCueOptions = {}) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    if (options.quietMode) return;

    try {
      window.speechSynthesis.cancel(); // Stop stale speech immediately to prevent voice queue backlog

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = options.speechRate || 1.0;
      utterance.pitch = 1.0;
      this.currentUtterance = utterance;

      window.speechSynthesis.speak(utterance);
    } catch {
      // SpeechSynthesis policy catch
    }
  }

  public static stopAll() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }

  /**
   * Headphone stereo test: plays left tone, center tone, then right tone.
   */
  public static runHeadphoneTest() {
    this.playEarcon('turn', -0.85);
    setTimeout(() => {
      this.playEarcon('alert', 0);
    }, 400);
    setTimeout(() => {
      this.playEarcon('turn', 0.85);
    }, 800);
  }
}
