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

const JPEG_MAGIC = [0xff, 0xd8, 0xff] as const;
const PNG_MAGIC = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a] as const;

export function isAllowedStepImageFile(file: File): boolean {
  const extension = file.name.split('.').pop()?.toLowerCase() ?? '';
  const hasAllowedExtension = ALLOWED_STEP_IMAGE_EXTENSIONS.includes(
    extension as (typeof ALLOWED_STEP_IMAGE_EXTENSIONS)[number],
  );
  const hasAllowedMime = ALLOWED_STEP_IMAGE_MIME_TYPES.includes(
    file.type as (typeof ALLOWED_STEP_IMAGE_MIME_TYPES)[number],
  );

  return hasAllowedExtension && (hasAllowedMime || file.type === '' || file.type === 'application/octet-stream');
}

export async function readStepImageDataUrl(file: File): Promise<string> {
  if (!isAllowedStepImageFile(file)) {
    return Promise.reject(new Error('Only JPEG, JPG, PNG, and SVG images are allowed.'));
  }

  const sniffedOk = await matchesImageMagicBytes(file);
  if (!sniffedOk) {
    return Promise.reject(new Error('File content does not match a supported image type.'));
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

async function matchesImageMagicBytes(file: File): Promise<boolean> {
  const extension = file.name.split('.').pop()?.toLowerCase() ?? '';
  const header = new Uint8Array(await file.slice(0, 16).arrayBuffer());

  if (extension === 'svg' || file.type === 'image/svg+xml') {
    const text = new TextDecoder().decode(header).trimStart().toLowerCase();
    return text.startsWith('<svg') || text.startsWith('<?xml');
  }

  if (extension === 'png' || file.type === 'image/png') {
    return startsWithBytes(header, PNG_MAGIC);
  }

  if (extension === 'jpg' || extension === 'jpeg' || file.type === 'image/jpeg') {
    return startsWithBytes(header, JPEG_MAGIC);
  }

  return (
    startsWithBytes(header, PNG_MAGIC) ||
    startsWithBytes(header, JPEG_MAGIC)
  );
}

function startsWithBytes(bytes: Uint8Array, magic: readonly number[]): boolean {
  if (bytes.length < magic.length) return false;
  return magic.every((value, index) => bytes[index] === value);
}
