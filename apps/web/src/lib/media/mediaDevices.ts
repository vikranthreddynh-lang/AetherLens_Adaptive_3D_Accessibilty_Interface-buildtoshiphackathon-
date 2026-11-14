export interface MediaDeviceItem {
  deviceId: string;
  label: string;
  kind: 'audioinput' | 'videoinput';
}

export class MediaDeviceService {
  public static isSupported(): boolean {
    return typeof navigator !== 'undefined' && !!navigator.mediaDevices && !!navigator.mediaDevices.getUserMedia;
  }

  public static async listDevices(): Promise<{
    audioInputs: MediaDeviceItem[];
    videoInputs: MediaDeviceItem[];
  }> {
    if (!this.isSupported()) {
      return { audioInputs: [], videoInputs: [] };
    }

    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const audioInputs: MediaDeviceItem[] = [];
      const videoInputs: MediaDeviceItem[] = [];

      for (const d of devices) {
        if (d.kind === 'audioinput') {
          audioInputs.push({
            deviceId: d.deviceId,
            label: d.label || `Microphone ${audioInputs.length + 1}`,
            kind: 'audioinput',
          });
        } else if (d.kind === 'videoinput') {
          videoInputs.push({
            deviceId: d.deviceId,
            label: d.label || `Camera ${videoInputs.length + 1}`,
            kind: 'videoinput',
          });
        }
      }

      return { audioInputs, videoInputs };
    } catch {
      return { audioInputs: [], videoInputs: [] };
    }
  }

  public static async requestStream(options: {
    audio?: boolean | { deviceId?: string };
    video?: boolean | { deviceId?: string };
  }): Promise<MediaStream> {
    if (!this.isSupported()) {
      throw new Error('MediaDevices API is not supported in this browser.');
    }

    const constraints: MediaStreamConstraints = {};

    if (options.audio) {
      constraints.audio = {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
        ...(typeof options.audio === 'object' && options.audio.deviceId
          ? { deviceId: { exact: options.audio.deviceId } }
          : {}),
      };
    }

    if (options.video) {
      constraints.video = {
        width: { ideal: 640 },
        height: { ideal: 480 },
        frameRate: { ideal: 15 },
        ...(typeof options.video === 'object' && options.video.deviceId
          ? { deviceId: { exact: options.video.deviceId } }
          : {}),
      };
    }

    return navigator.mediaDevices.getUserMedia(constraints);
  }

  public static stopStream(stream: MediaStream | null) {
    if (!stream) return;
    for (const track of stream.getTracks()) {
      track.stop();
    }
  }
}
