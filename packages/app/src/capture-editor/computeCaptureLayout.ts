import type { CaptureEditorSettings, NormalizedRect } from '@peacock/shared';
import { computeCaptureHeaderHeight } from './captureHeaderTypography';

export interface CaptureLayout {
  canvasWidth: number;
  canvasHeight: number;
  imageWidth: number;
  imageHeight: number;
  imageLeft: number;
  imageTop: number;
  headerHeight: number;
  /** Source-normalized crop used for export */
  crop: NormalizedRect;
  isCropPreview: boolean;
}

export interface ComputeCaptureLayoutOptions {
  cropPreview?: boolean;
}

export function getEffectiveCrop(crop: NormalizedRect): NormalizedRect {
  const x = Math.max(0, Math.min(1, crop.x));
  const y = Math.max(0, Math.min(1, crop.y));
  const width = Math.max(0.02, Math.min(1 - x, crop.width));
  const height = Math.max(0.02, Math.min(1 - y, crop.height));
  return { x, y, width, height };
}

export function computeCaptureLayout(
  sourceWidth: number,
  sourceHeight: number,
  settings: CaptureEditorSettings,
  options?: ComputeCaptureLayoutOptions,
): CaptureLayout {
  const crop = getEffectiveCrop(settings.crop);
  const isCropPreview = options?.cropPreview ?? false;
  const padding = Math.max(0, Math.round(settings.padding));

  const imageWidth = isCropPreview
    ? Math.max(1, Math.round(sourceWidth))
    : Math.max(1, Math.round(sourceWidth * crop.width));
  const imageHeight = isCropPreview
    ? Math.max(1, Math.round(sourceHeight))
    : Math.max(1, Math.round(sourceHeight * crop.height));

  const headerHeight = computeCaptureHeaderHeight(
    settings.title,
    settings.description,
    imageWidth,
  );
  const imageTop = padding + headerHeight;

  return {
    crop,
    isCropPreview,
    imageWidth,
    imageHeight,
    imageLeft: padding,
    imageTop,
    headerHeight,
    canvasWidth: imageWidth + padding * 2,
    canvasHeight: imageTop + imageHeight + padding,
  };
}

/** Map a rect normalized to the full source image (0–1) onto the canvas image frame. */
export function sourceNormalizedToCanvasRect(
  rect: NormalizedRect,
  layout: CaptureLayout,
): { x: number; y: number; width: number; height: number } {
  return {
    x: layout.imageLeft + rect.x * layout.imageWidth,
    y: layout.imageTop + rect.y * layout.imageHeight,
    width: rect.width * layout.imageWidth,
    height: rect.height * layout.imageHeight,
  };
}

/** Map a rect normalized to the cropped/exported image (0–1) onto the canvas. */
export function normalizedToCanvasRect(
  rect: NormalizedRect,
  layout: CaptureLayout,
): { x: number; y: number; width: number; height: number } {
  if (layout.isCropPreview) {
    return sourceNormalizedToCanvasRect(rect, layout);
  }

  return {
    x: layout.imageLeft + rect.x * layout.imageWidth,
    y: layout.imageTop + rect.y * layout.imageHeight,
    width: rect.width * layout.imageWidth,
    height: rect.height * layout.imageHeight,
  };
}

export function canvasPointToNormalized(
  canvasX: number,
  canvasY: number,
  layout: CaptureLayout,
): { x: number; y: number } | null {
  const x = (canvasX - layout.imageLeft) / layout.imageWidth;
  const y = (canvasY - layout.imageTop) / layout.imageHeight;
  if (x < 0 || x > 1 || y < 0 || y > 1) return null;
  return { x, y };
}

/** Normalized point in cropped-image space (for blur/redact regions). */
export function canvasPointToCroppedNormalized(
  canvasX: number,
  canvasY: number,
  layout: CaptureLayout,
): { x: number; y: number } | null {
  const point = canvasPointToNormalized(canvasX, canvasY, layout);
  if (!point || layout.isCropPreview) return null;
  return point;
}

/** Normalized point in full-source space (for crop tool). */
export function canvasPointToSourceNormalized(
  canvasX: number,
  canvasY: number,
  layout: CaptureLayout,
): { x: number; y: number } | null {
  if (!layout.isCropPreview) return null;
  return canvasPointToNormalized(canvasX, canvasY, layout);
}

export function normalizeRectFromPoints(
  x0: number,
  y0: number,
  x1: number,
  y1: number,
): NormalizedRect {
  const x = Math.min(x0, x1);
  const y = Math.min(y0, y1);
  const width = Math.max(0.02, Math.abs(x1 - x0));
  const height = Math.max(0.02, Math.abs(y1 - y0));
  return {
    x: Math.max(0, Math.min(1 - width, x)),
    y: Math.max(0, Math.min(1 - height, y)),
    width: Math.min(1 - x, width),
    height: Math.min(1 - y, height),
  };
}
