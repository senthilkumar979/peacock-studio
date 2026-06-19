import type { CaptureBackgroundPreset } from '@peacock/shared';
import { roundRectPath } from './canvasRoundRect';
import { getGradientVector } from './gradientVector';

type PaintContext = CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;

function resolveBackgroundFill(
  context: PaintContext,
  width: number,
  height: number,
  preset: CaptureBackgroundPreset,
): CanvasGradient | string {
  if (preset.kind === 'solid' && preset.solidColor) {
    return preset.solidColor;
  }

  const stops = preset.gradientStops ?? [];
  const angle = preset.gradientAngle ?? 135;
  const { x0, y0, x1, y1 } = getGradientVector(angle, width, height);
  const gradient = context.createLinearGradient(x0, y0, x1, y1);

  for (const stop of stops) {
    gradient.addColorStop(stop.offset, stop.color);
  }

  return gradient;
}

export function drawCaptureBackground(
  context: PaintContext,
  width: number,
  height: number,
  preset: CaptureBackgroundPreset,
  cornerRadius = 0,
): void {
  const fillStyle = resolveBackgroundFill(context, width, height, preset);
  const radius = Math.max(0, Math.round(cornerRadius));

  context.fillStyle = fillStyle;

  if (radius <= 0) {
    context.fillRect(0, 0, width, height);
    return;
  }

  context.save();
  roundRectPath(context, 0, 0, width, height, radius);
  context.fill();
  context.restore();
}
