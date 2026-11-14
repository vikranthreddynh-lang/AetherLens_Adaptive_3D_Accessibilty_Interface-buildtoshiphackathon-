import { LocalVisualObservation } from '@senseweave/shared';

export class LocalVisualDetector {
  private previousImageData: ImageData | null = null;
  private lastTriggerTime = 0;

  public processFrame(currentImageData: ImageData): LocalVisualObservation | null {
    if (!this.previousImageData) {
      this.previousImageData = currentImageData;
      return null;
    }

    const now = Date.now();
    // Throttle local gesture events to avoid high-frequency chatter
    if (now - this.lastTriggerTime < 2500) {
      this.previousImageData = currentImageData;
      return null;
    }

    const prev = this.previousImageData.data;
    const curr = currentImageData.data;
    const width = currentImageData.width;
    const height = currentImageData.height;

    const threshold = 35;
    let upperLeftChanges = 0;
    let upperCenterChanges = 0;
    let upperRightChanges = 0;
    let lowerChanges = 0;
    let totalChanges = 0;

    const thirdW = width / 3;
    const halfH = height / 2;

    // Sample every 4th pixel for high performance without dropping frames
    for (let y = 0; y < height; y += 4) {
      for (let x = 0; x < width; x += 4) {
        const i = (y * width + x) * 4;
        const diff =
          Math.abs(curr[i] - prev[i]) +
          Math.abs(curr[i + 1] - prev[i + 1]) +
          Math.abs(curr[i + 2] - prev[i + 2]);

        if (diff > threshold * 3) {
          totalChanges += 1;
          if (y < halfH) {
            if (x < thirdW) upperLeftChanges += 1;
            else if (x < thirdW * 2) upperCenterChanges += 1;
            else upperRightChanges += 1;
          } else {
            lowerChanges += 1;
          }
        }
      }
    }

    this.previousImageData = currentImageData;

    const totalSampledPixels = (width / 4) * (height / 4);
    const motionRatio = totalChanges / totalSampledPixels;

    if (motionRatio < 0.035) {
      return null; // Baseline stillness
    }

    let gestureType: LocalVisualObservation['gestureType'] = 'none';
    let horizontal: LocalVisualObservation['relativePosition']['horizontal'] = 'unknown';
    let vertical: LocalVisualObservation['relativePosition']['vertical'] = 'unknown';
    let confidence = 0.65;
    let evidence = '';

    // 1. Raised Hand: Dominant motion concentrated in upper portion
    if (
      (upperLeftChanges > lowerChanges * 1.6 ||
        upperCenterChanges > lowerChanges * 1.6 ||
        upperRightChanges > lowerChanges * 1.6) &&
      motionRatio > 0.04
    ) {
      gestureType = 'raised_hand';
      vertical = 'upper';
      if (upperLeftChanges > upperCenterChanges && upperLeftChanges > upperRightChanges) {
        horizontal = 'left';
      } else if (upperRightChanges > upperCenterChanges && upperRightChanges > upperLeftChanges) {
        horizontal = 'right';
      } else {
        horizontal = 'center';
      }
      confidence = 0.82;
      evidence = `Vertical upper motion detected (camera-${horizontal}).`;
    }
    // 2. Pointing gesture (lateral motion extension)
    else if (upperLeftChanges > totalChanges * 0.45) {
      gestureType = 'pointing_left';
      horizontal = 'left';
      vertical = 'center';
      confidence = 0.72;
      evidence = 'Observable lateral extension on camera-left.';
    } else if (upperRightChanges > totalChanges * 0.45) {
      gestureType = 'pointing_right';
      horizontal = 'right';
      vertical = 'center';
      confidence = 0.72;
      evidence = 'Observable lateral extension on camera-right.';
    }
    // 3. Broad orientation shift
    else if (motionRatio > 0.18) {
      gestureType = 'orientation_shift';
      horizontal = 'center';
      vertical = 'center';
      confidence = 0.75;
      evidence = 'Broad optical change across visual field.';
    } else {
      gestureType = 'general_motion';
      horizontal = 'unknown';
      vertical = 'unknown';
      confidence = 0.6;
      evidence = 'Observable physical motion detected.';
    }

    if ((gestureType as string) === 'none') return null;

    this.lastTriggerTime = now;

    return {
      gestureType,
      confidence,
      relativePosition: {
        horizontal,
        vertical,
        basis: 'camera_frame',
      },
      evidence,
      timestamp: now,
    };
  }
}
