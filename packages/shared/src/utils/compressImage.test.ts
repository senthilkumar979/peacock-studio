import { afterEach, describe, expect, it, vi } from 'vitest';
import { MAX_IMAGE_BYTES } from '../constants/limits';
import {
  ImageTooLargeError,
  blobToDataUrl,
  compressImageToMaxBytes,
  fitWithin,
  formatMaxImageLabel,
  isSvgImageBlob,
} from './compressImage';

class FakeImageBitmap {
  width: number;
  height: number;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
  }

  close(): void {}
}

function installCanvasMocks(options: {
  width?: number;
  height?: number;
  /** Approximate encoded size multiplier: width * height * quality * factor */
  bytesPerPixelAtFullQuality?: number;
}): void {
  const width = options.width ?? 2000;
  const height = options.height ?? 2000;
  const factor = options.bytesPerPixelAtFullQuality ?? 0.5;

  vi.stubGlobal('createImageBitmap', async () => new FakeImageBitmap(width, height));

  class FakeOffscreenCanvas {
    width: number;
    height: number;

    constructor(canvasWidth: number, canvasHeight: number) {
      this.width = canvasWidth;
      this.height = canvasHeight;
    }

    getContext(): {
      fillStyle: string;
      fillRect: () => void;
      drawImage: () => void;
    } {
      return {
        fillStyle: '',
        fillRect: () => undefined,
        drawImage: () => undefined,
      };
    }

    convertToBlob(settings: { type: string; quality?: number }): Promise<Blob> {
      const quality = settings.quality ?? 1;
      const size = Math.max(1, Math.floor(this.width * this.height * quality * factor));
      return Promise.resolve(new Blob([new Uint8Array(size)], { type: settings.type }));
    }
  }

  vi.stubGlobal('OffscreenCanvas', FakeOffscreenCanvas);
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('compressImage helpers', () => {
  it('formats the max image label', () => {
    expect(formatMaxImageLabel(MAX_IMAGE_BYTES)).toBe('2 MB');
    expect(formatMaxImageLabel(1.5 * 1024 * 1024)).toBe('1.5 MB');
  });

  it('detects SVG blobs', () => {
    expect(isSvgImageBlob(new Blob(['<svg/>'], { type: 'image/svg+xml' }))).toBe(true);
    expect(isSvgImageBlob(new Blob(['x'], { type: 'image/png' }))).toBe(false);
  });

  it('fits dimensions within a max edge', () => {
    expect(fitWithin(4000, 2000, 1920)).toEqual({ width: 1920, height: 960 });
    expect(fitWithin(800, 600, 1920)).toEqual({ width: 800, height: 600 });
  });
});

describe('compressImageToMaxBytes', () => {
  it('passes through blobs already under the limit', async () => {
    const blob = new Blob([new Uint8Array(100)], { type: 'image/png' });
    const result = await compressImageToMaxBytes(blob, 1024);
    expect(result).toBe(blob);
  });

  it('rejects oversized SVG without rasterizing', async () => {
    const svg = new Blob([new Uint8Array(3000)], { type: 'image/svg+xml' });
    await expect(compressImageToMaxBytes(svg, 1024)).rejects.toBeInstanceOf(ImageTooLargeError);
  });

  it('compresses an oversized raster image under the budget', async () => {
    installCanvasMocks({
      width: 3000,
      height: 2000,
      bytesPerPixelAtFullQuality: 0.8,
    });

    const source = new Blob([new Uint8Array(3 * 1024 * 1024)], { type: 'image/png' });
    const compressed = await compressImageToMaxBytes(source, MAX_IMAGE_BYTES);

    expect(compressed.size).toBeLessThanOrEqual(MAX_IMAGE_BYTES);
    expect(compressed.type).toBe('image/jpeg');
  });

  it('throws when encoded output cannot fit the budget', async () => {
    installCanvasMocks({
      width: 4000,
      height: 4000,
      // Even min edge + min quality stays huge vs a tiny budget.
      bytesPerPixelAtFullQuality: 2,
    });

    const source = new Blob([new Uint8Array(3 * 1024 * 1024)], { type: 'image/png' });
    await expect(compressImageToMaxBytes(source, 500)).rejects.toBeInstanceOf(ImageTooLargeError);
  });
});

describe('blobToDataUrl', () => {
  it('encodes a blob as a data URL', async () => {
    const blob = new Blob([new Uint8Array([1, 2, 3])], { type: 'image/png' });
    const dataUrl = await blobToDataUrl(blob);
    expect(dataUrl.startsWith('data:image/png;base64,')).toBe(true);
    expect(atob(dataUrl.split(',')[1] ?? '')).toHaveLength(3);
  });
});
