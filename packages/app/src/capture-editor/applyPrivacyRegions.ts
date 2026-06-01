import type { CapturePrivacyRegion } from '@peacock/shared';
import type { CaptureLayout } from './computeCaptureLayout';
import { normalizedToCanvasRect } from './computeCaptureLayout';

type PaintContext = CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;

interface DeviceRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

function toDeviceRect(matrix: DOMMatrix, rect: DeviceRect): DeviceRect {
  return {
    x: Math.floor(rect.x * matrix.a + matrix.e),
    y: Math.floor(rect.y * matrix.d + matrix.f),
    width: Math.max(1, Math.floor(rect.width * matrix.a)),
    height: Math.max(1, Math.floor(rect.height * matrix.d)),
  };
}

function imageSourceRectForRegion(
  regionRect: { x: number; y: number; width: number; height: number },
  layout: CaptureLayout,
  naturalWidth: number,
  naturalHeight: number,
): DeviceRect {
  const crop = layout.crop;
  const nx = crop.x + regionRect.x * crop.width;
  const ny = crop.y + regionRect.y * crop.height;
  const nw = regionRect.width * crop.width;
  const nh = regionRect.height * crop.height;

  return {
    x: Math.round(nx * naturalWidth),
    y: Math.round(ny * naturalHeight),
    width: Math.max(1, Math.round(nw * naturalWidth)),
    height: Math.max(1, Math.round(nh * naturalHeight)),
  };
}

function createSurface(width: number, height: number): {
  canvas: HTMLCanvasElement | OffscreenCanvas;
  context: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;
} | null {
  if (typeof OffscreenCanvas !== 'undefined') {
    const canvas = new OffscreenCanvas(width, height);
    const context = canvas.getContext('2d');
    if (!context) return null;
    return { canvas, context };
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  if (!context) return null;
  return { canvas, context };
}

function blurRegionFromImage(
  image: CanvasImageSource,
  sourceRect: DeviceRect,
  context: PaintContext,
  destRect: DeviceRect,
  intensity: number,
): void {
  const { width: destW, height: destH, x: destX, y: destY } = destRect;
  const sample = createSurface(destW, destH);
  if (!sample) return;

  sample.context.drawImage(
    image,
    sourceRect.x,
    sourceRect.y,
    sourceRect.width,
    sourceRect.height,
    0,
    0,
    destW,
    destH,
  );

  const strength = Math.max(4, Math.min(24, intensity));
  const downscale = Math.max(0.04, 1 / (strength * 0.45));
  const smallW = Math.max(1, Math.round(destW * downscale));
  const smallH = Math.max(1, Math.round(destH * downscale));
  const small = createSurface(smallW, smallH);
  if (!small) return;

  small.context.drawImage(sample.canvas, 0, 0, destW, destH, 0, 0, smallW, smallH);

  context.save();
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = 'low';
  context.drawImage(small.canvas, 0, 0, smallW, smallH, destX, destY, destW, destH);
  context.restore();
}

function redactRegion(context: PaintContext, rect: DeviceRect): void {
  context.fillStyle = '#ffffff';
  context.fillRect(rect.x, rect.y, rect.width, rect.height);
}

export function applyPrivacyRegions(
  context: PaintContext,
  layout: CaptureLayout,
  regions: CapturePrivacyRegion[],
  image: HTMLImageElement,
): void {
  if (regions.length === 0 || layout.isCropPreview) return;

  const matrix = context.getTransform();

  context.save();
  context.setTransform(1, 0, 0, 1, 0, 0);

  for (const region of regions) {
    const logical = normalizedToCanvasRect(region.rect, layout);
    const device = toDeviceRect(matrix, logical);
    if (device.width < 4 || device.height < 4) continue;

    if (region.mode === 'blur') {
      const sourceRect = imageSourceRectForRegion(
        region.rect,
        layout,
        image.naturalWidth,
        image.naturalHeight,
      );
      blurRegionFromImage(image, sourceRect, context, device, region.intensity);
      continue;
    }

    redactRegion(context, device);
  }

  context.restore();
}
