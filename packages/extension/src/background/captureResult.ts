import { compressImageToMaxBytes, createId } from '@peacock/shared';
import { saveCaptureResult } from '../storage/db';

export type ScreenshotToolMode = 'full-page' | 'visible' | 'selection';

interface SelectionCaptureArea {
  left: number;
  top: number;
  width: number;
  height: number;
  viewportWidth: number;
  viewportHeight: number;
}

interface FullPageSlice {
  blob: Blob;
  scrollY: number;
}

async function blobToBitmap(blob: Blob): Promise<ImageBitmap> {
  return createImageBitmap(blob);
}

export async function cropVisibleCapture(
  blob: Blob,
  selection: SelectionCaptureArea
): Promise<Blob> {
  const bitmap = await blobToBitmap(blob);

  try {
    const scaleX = bitmap.width / selection.viewportWidth;
    const scaleY = bitmap.height / selection.viewportHeight;
    const sx = Math.max(0, Math.round(selection.left * scaleX));
    const sy = Math.max(0, Math.round(selection.top * scaleY));
    const sw = Math.max(1, Math.round(selection.width * scaleX));
    const sh = Math.max(1, Math.round(selection.height * scaleY));

    const canvas = new OffscreenCanvas(sw, sh);
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Could not create capture canvas');

    context.drawImage(bitmap, sx, sy, sw, sh, 0, 0, sw, sh);
    return canvas.convertToBlob({ type: 'image/png' });
  } finally {
    bitmap?.close();
  }
}

export async function stitchFullPageCaptures(
  slices: FullPageSlice[],
  fullHeight: number,
  viewportWidth: number
): Promise<Blob> {
  if (slices.length === 0) {
    throw new Error('No screenshot slices available');
  }

  const bitmaps = await Promise.all(slices.map((slice) => blobToBitmap(slice.blob)));

  try {
    const baseBitmap = bitmaps[0];
    if (!baseBitmap) {
      throw new Error('No screenshot slices available');
    }

    const scale = baseBitmap.width / viewportWidth;
    const width = baseBitmap.width;
    const height = Math.max(1, Math.round(fullHeight * scale));

    const canvas = new OffscreenCanvas(width, height);
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Could not create stitch canvas');

    context.clearRect(0, 0, width, height);

    for (const [index, bitmap] of bitmaps.entries()) {
      const slice = slices[index];
      if (!slice) continue;
      const drawY = Math.round(slice.scrollY * scale);
      context.drawImage(bitmap, 0, drawY, bitmap.width, bitmap.height);
    }

    return canvas.convertToBlob({ type: 'image/png' });
  } finally {
    for (const bitmap of bitmaps) {
      bitmap?.close();
    }
  }
}

export async function openCaptureResult(blob: Blob, mode: ScreenshotToolMode): Promise<void> {
  const captureId = createId();
  const compressed = await compressImageToMaxBytes(blob);
  await saveCaptureResult({
    id: captureId,
    blob: compressed,
    mode,
    createdAt: Date.now(),
  });

  const url = chrome.runtime.getURL(`screenshot/index.html?captureId=${captureId}`);
  await chrome.tabs.create({ url });
}
