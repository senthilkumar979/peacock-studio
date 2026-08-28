import {
  MAX_IMAGE_BYTES,
  blobToDataUrl,
  compressImageToMaxBytes,
  type CaptureEditorSettings,
} from '@peacock/shared';
import { renderCaptureComposite } from '@/capture-editor/renderCaptureComposite';

interface RenderStepScreenshotInput {
  imageDataUrl: string;
  naturalWidth: number;
  naturalHeight: number;
  settings: CaptureEditorSettings;
}

export async function renderStepScreenshotDataUrl(
  input: RenderStepScreenshotInput,
): Promise<string> {
  const blob = await renderCaptureComposite(input);
  const compressed = await compressImageToMaxBytes(blob, MAX_IMAGE_BYTES);
  return blobToDataUrl(compressed);
}
