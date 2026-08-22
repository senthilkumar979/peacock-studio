import {
  VIDEO_ORIGIN_CLAMP_MAX,
  VIDEO_ORIGIN_CLAMP_MIN,
} from './videoConstants';
import type { VideoMarker } from './videoBeats';

export function normalizeUnitPercent(value: number): number {
  if (!Number.isFinite(value)) return 0;
  if (value > 1) return Math.min(1, Math.max(0, value / 100));
  if (value < 0) return 0;
  return value;
}

export function clampZoomOrigin(xPercent: number, yPercent: number): VideoMarker {
  const x = normalizeUnitPercent(xPercent);
  const y = normalizeUnitPercent(yPercent);
  return {
    x: Math.min(VIDEO_ORIGIN_CLAMP_MAX, Math.max(VIDEO_ORIGIN_CLAMP_MIN, x)),
    y: Math.min(VIDEO_ORIGIN_CLAMP_MAX, Math.max(VIDEO_ORIGIN_CLAMP_MIN, y)),
  };
}
