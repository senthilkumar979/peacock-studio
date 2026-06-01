import type { CaptureBackgroundPreset } from '@peacock/shared';
import { getGradientVector } from './gradientVector';

type PaintContext = CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;

export function drawCaptureBackground(
  context: PaintContext,
  width: number,
  height: number,
  preset: CaptureBackgroundPreset,
): void {
  if (preset.kind === 'solid' && preset.solidColor) {
    context.fillStyle = preset.solidColor;
    context.fillRect(0, 0, width, height);
    return;
  }

  const stops = preset.gradientStops ?? [];
  const angle = preset.gradientAngle ?? 135;
  const { x0, y0, x1, y1 } = getGradientVector(angle, width, height);
  const gradient = context.createLinearGradient(x0, y0, x1, y1);

  for (const stop of stops) {
    gradient.addColorStop(stop.offset, stop.color);
  }

  context.fillStyle = gradient;
  context.fillRect(0, 0, width, height);
}

export async function drawCustomCaptureBackground(
  context: PaintContext,
  width: number,
  height: number,
  imageUrl: string,
): Promise<void> {
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Could not load custom background'));
    img.src = imageUrl;
  });

  const scale = Math.max(width / image.naturalWidth, height / image.naturalHeight);
  const drawWidth = image.naturalWidth * scale;
  const drawHeight = image.naturalHeight * scale;
  const offsetX = (width - drawWidth) / 2;
  const offsetY = (height - drawHeight) / 2;

  context.drawImage(image, offsetX, offsetY, drawWidth, drawHeight);
}
