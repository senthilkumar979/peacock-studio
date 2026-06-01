import type { CaptureEditorSettings } from '@peacock/shared';
import { computeCaptureLayout } from './computeCaptureLayout';
import { paintCaptureComposite } from './paintCaptureComposite';

interface RenderCaptureInput {
  imageDataUrl: string;
  naturalWidth: number;
  naturalHeight: number;
  settings: CaptureEditorSettings;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Failed to load screenshot image'));
    image.src = src;
  });
}

export async function renderCaptureComposite(input: RenderCaptureInput): Promise<Blob> {
  const image = await loadImage(input.imageDataUrl);
  const layout = computeCaptureLayout(input.naturalWidth, input.naturalHeight, input.settings);
  const canvas = new OffscreenCanvas(layout.canvasWidth, layout.canvasHeight);
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Could not create export canvas');

  await paintCaptureComposite(context, {
    image,
    naturalWidth: input.naturalWidth,
    naturalHeight: input.naturalHeight,
    settings: input.settings,
  });

  const blob = await canvas.convertToBlob({ type: 'image/png' });
  if (!blob) throw new Error('Could not export PNG');
  return blob;
}
