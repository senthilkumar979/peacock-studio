import type { CaptureResultHandoff } from '@peacock/shared';
import { blobToDataUrl } from '../utils/blobToDataUrl';
import { getCaptureResult } from '../storage/db';

export async function buildCaptureResultHandoff(captureId: string): Promise<CaptureResultHandoff> {
  const capture = await getCaptureResult(captureId);
  if (!capture) {
    return { ok: false, error: 'Capture not found or expired. Take a new screenshot from the extension.' };
  }

  const bitmap = await createImageBitmap(capture.blob);
  const naturalWidth = bitmap.width;
  const naturalHeight = bitmap.height;
  bitmap.close();

  const imageDataUrl = await blobToDataUrl(capture.blob);

  return {
    ok: true,
    captureId: capture.id,
    mode: capture.mode,
    imageDataUrl,
    naturalWidth,
    naturalHeight,
  };
}
