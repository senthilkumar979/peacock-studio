import {
  ImageTooLargeError,
  blobToDataUrl,
  compressImageToMaxBytes,
  formatMaxImageLabel,
  isSvgImageBlob,
} from '@peacock/shared';
import {
  ALLOWED_STEP_IMAGE_EXTENSIONS,
  ALLOWED_STEP_IMAGE_MIME_TYPES,
  MAX_STEP_IMAGE_BYTES,
} from '@/constants/stepImageUpload';

export function isAllowedStepImageFile(file: File): boolean {
  const extension = file.name.split('.').pop()?.toLowerCase() ?? '';
  const hasAllowedExtension = ALLOWED_STEP_IMAGE_EXTENSIONS.includes(
    extension as (typeof ALLOWED_STEP_IMAGE_EXTENSIONS)[number]
  );
  const hasAllowedMime = ALLOWED_STEP_IMAGE_MIME_TYPES.includes(
    file.type as (typeof ALLOWED_STEP_IMAGE_MIME_TYPES)[number]
  );

  return hasAllowedExtension || hasAllowedMime;
}

export async function readStepImageDataUrl(file: File): Promise<string> {
  if (!isAllowedStepImageFile(file)) {
    return Promise.reject(new Error('Only JPEG, JPG, PNG, and SVG images are allowed.'));
  }

  if (isSvgImageBlob(file) && file.size > MAX_STEP_IMAGE_BYTES) {
    throw new ImageTooLargeError(MAX_STEP_IMAGE_BYTES);
  }

  try {
    const prepared = await compressImageToMaxBytes(file, MAX_STEP_IMAGE_BYTES);
    return blobToDataUrl(prepared);
  } catch (error) {
    if (error instanceof ImageTooLargeError) throw error;
    if (error instanceof Error) throw error;
    throw new Error(
      `Could not process image. Use a file ${formatMaxImageLabel(MAX_STEP_IMAGE_BYTES)} or smaller.`,
    );
  }
}
