import { RelativePosition } from '@senseweave/shared';

export interface SpatialPanResult {
  enabled: boolean;
  pan: number; // -1.0 (left) to 1.0 (right)
  spatialLabel: string;
}

export function normalizeRelativePosition(raw: Partial<RelativePosition> | undefined): RelativePosition {
  if (!raw) {
    return { horizontal: 'unknown', vertical: 'unknown', basis: 'unknown' };
  }

  const horizontal = ['left', 'center', 'right', 'unknown'].includes(raw.horizontal || '')
    ? (raw.horizontal as RelativePosition['horizontal'])
    : 'unknown';

  const vertical = ['upper', 'center', 'lower', 'unknown'].includes(raw.vertical || '')
    ? (raw.vertical as RelativePosition['vertical'])
    : 'unknown';

  const basis = ['camera_frame', 'calibrated_device', 'multichannel_audio', 'unknown'].includes(raw.basis || '')
    ? (raw.basis as RelativePosition['basis'])
    : 'unknown';

  return { horizontal, vertical, basis };
}

export function computeSpatialPan(
  position: RelativePosition,
  spatialAudioPreferred: boolean
): SpatialPanResult {
  if (!spatialAudioPreferred || position.basis === 'unknown' || position.horizontal === 'unknown') {
    return {
      enabled: false,
      pan: 0,
      spatialLabel: 'direction unknown',
    };
  }

  let pan = 0;
  let spatialLabel = 'ahead';

  if (position.horizontal === 'left') {
    pan = -0.75;
    spatialLabel = position.basis === 'camera_frame' ? 'camera-left' : 'left';
  } else if (position.horizontal === 'right') {
    pan = 0.75;
    spatialLabel = position.basis === 'camera_frame' ? 'camera-right' : 'right';
  } else if (position.horizontal === 'center') {
    pan = 0;
    spatialLabel = position.basis === 'camera_frame' ? 'camera-center' : 'ahead';
  }

  return {
    enabled: true,
    pan,
    spatialLabel,
  };
}
