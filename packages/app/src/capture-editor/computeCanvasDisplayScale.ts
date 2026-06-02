/** Keeps editor canvas sharp: fit to container, honor devicePixelRatio, avoid huge bitmaps. */

const MAX_BITMAP_EDGE = 8192;

export interface CanvasDisplayScale {
  /** Multiplier for canvas backing store and 2D transform (logical → bitmap). */
  bitmapScale: number;
  /** CSS width/height as a fraction of logical layout size. */
  fitScale: number;
}

export function computeCanvasDisplayScale(
  layoutWidth: number,
  layoutHeight: number,
  containerWidth: number,
  containerHeight: number,
): CanvasDisplayScale {
  const logicalMax = Math.max(layoutWidth, layoutHeight, 1);
  const containerW = Math.max(containerWidth, 1);
  const containerH = Math.max(containerHeight, 1);

  const fitScale = Math.min(1, containerW / layoutWidth, containerH / layoutHeight);
  const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
  let bitmapScale = fitScale * dpr;

  if (logicalMax * bitmapScale > MAX_BITMAP_EDGE) {
    bitmapScale = MAX_BITMAP_EDGE / logicalMax;
  }

  return { bitmapScale, fitScale };
}
