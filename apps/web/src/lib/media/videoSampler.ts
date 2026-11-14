export class VideoSampler {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D | null;
  private targetWidth = 480;
  private targetHeight = 360;

  constructor(targetWidth = 480, targetHeight = 360) {
    this.targetWidth = targetWidth;
    this.targetHeight = targetHeight;
    this.canvas = document.createElement('canvas');
    this.canvas.width = targetWidth;
    this.canvas.height = targetHeight;
    this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });
  }

  public sampleFrame(videoElement: HTMLVideoElement): {
    data: string; // Base64 JPEG data without data-URL prefix
    mimeType: string;
    timestamp: number;
    imageData: ImageData | null;
  } | null {
    if (!this.ctx || !videoElement || videoElement.readyState < 2) {
      return null;
    }

    try {
      this.ctx.drawImage(videoElement, 0, 0, this.targetWidth, this.targetHeight);
      const dataUrl = this.canvas.toDataURL('image/jpeg', 0.65);
      const base64Data = dataUrl.split(',')[1] || '';
      const imageData = this.ctx.getImageData(0, 0, this.targetWidth, this.targetHeight);

      return {
        data: base64Data,
        mimeType: 'image/jpeg',
        timestamp: Date.now(),
        imageData,
      };
    } catch {
      return null;
    }
  }
}
