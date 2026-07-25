import { MAX_IMAGE_BYTES } from '../constants/limits';

/** Max long-edge lengths tried when an image still exceeds the byte budget. */
const MAX_EDGE_STEPS = [1920, 1600, 1280, 1024, 800, 640] as const;

const MIN_QUALITY = 0.42;
const MAX_QUALITY = 0.92;
/** JPEG conversion drops PNG transparency — acceptable for UI screenshots. */
const OUTPUT_MIME = 'image/jpeg';

export class ImageTooLargeError extends Error {
  constructor(maxBytes: number = MAX_IMAGE_BYTES) {
    super(`Image must be ${formatMaxImageLabel(maxBytes)} or smaller.`);
    this.name = 'ImageTooLargeError';
  }
}

export function formatMaxImageLabel(maxBytes: number = MAX_IMAGE_BYTES): string {
  const mb = maxBytes / (1024 * 1024);
  const label = Number.isInteger(mb) ? String(mb) : mb.toFixed(1);
  return `${label} MB`;
}

export function isSvgImageBlob(blob: Blob): boolean {
  return blob.type === 'image/svg+xml' || blob.type.includes('svg');
}

/**
 * Ensures a raster image fits under `maxBytes`.
 * Passes through when already small enough; otherwise downscales and re-encodes as JPEG.
 * SVGs are not rasterized — oversized SVGs throw {@link ImageTooLargeError}.
 */
export async function compressImageToMaxBytes(
  blob: Blob,
  maxBytes: number = MAX_IMAGE_BYTES,
): Promise<Blob> {
  if (blob.size <= maxBytes) return blob;

  if (isSvgImageBlob(blob)) {
    throw new ImageTooLargeError(maxBytes);
  }

  const bitmap = await createImageBitmap(blob);

  try {
    for (const maxEdge of MAX_EDGE_STEPS) {
      const { width, height } = fitWithin(bitmap.width, bitmap.height, maxEdge);
      const encoded = await encodeUnderBudget(bitmap, width, height, maxBytes);
      if (encoded) return encoded;
    }
  } finally {
    bitmap.close();
  }

  throw new ImageTooLargeError(maxBytes);
}

export async function blobToDataUrl(blob: Blob): Promise<string> {
  const buffer = await blob.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  const chunkSize = 0x8000;
  let binary = '';

  for (let offset = 0; offset < bytes.length; offset += chunkSize) {
    const end = Math.min(offset + chunkSize, bytes.length);
    let chunk = '';
    for (let index = offset; index < end; index += 1) {
      chunk += String.fromCharCode(bytes[index]!);
    }
    binary += chunk;
  }

  const mime = blob.type || 'application/octet-stream';
  return `data:${mime};base64,${btoa(binary)}`;
}

export function fitWithin(
  width: number,
  height: number,
  maxEdge: number,
): { width: number; height: number } {
  const longest = Math.max(width, height);
  if (longest <= maxEdge) {
    return { width: Math.max(1, Math.round(width)), height: Math.max(1, Math.round(height)) };
  }

  const scale = maxEdge / longest;
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

async function encodeUnderBudget(
  source: ImageBitmap,
  width: number,
  height: number,
  maxBytes: number,
): Promise<Blob | null> {
  const atMaxQuality = await drawAndEncode(source, width, height, MAX_QUALITY);
  if (atMaxQuality.size <= maxBytes) return atMaxQuality;

  let low = MIN_QUALITY;
  let high = MAX_QUALITY;
  let best: Blob | null = null;

  for (let attempt = 0; attempt < 7; attempt += 1) {
    const quality = (low + high) / 2;
    const encoded = await drawAndEncode(source, width, height, quality);

    if (encoded.size <= maxBytes) {
      best = encoded;
      low = quality;
    } else {
      high = quality;
    }
  }

  if (best) return best;

  const atMinQuality = await drawAndEncode(source, width, height, MIN_QUALITY);
  return atMinQuality.size <= maxBytes ? atMinQuality : null;
}

async function drawAndEncode(
  source: ImageBitmap,
  width: number,
  height: number,
  quality: number,
): Promise<Blob> {
  if (typeof OffscreenCanvas !== 'undefined') {
    const canvas = new OffscreenCanvas(width, height);
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Could not create image canvas.');

    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, width, height);
    context.drawImage(source, 0, 0, width, height);
    return canvas.convertToBlob({ type: OUTPUT_MIME, quality });
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Could not create image canvas.');

  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, width, height);
  context.drawImage(source, 0, 0, width, height);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (result) => {
        if (!result) {
          reject(new Error('Could not encode image.'));
          return;
        }
        resolve(result);
      },
      OUTPUT_MIME,
      quality,
    );
  });
}
