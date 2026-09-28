import { afterEach, describe, expect, it, vi } from 'vitest';
import { convertImageBlobToPng, copyImageBlobToClipboard } from './clipboardImage';

describe('clipboardImage', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns PNG blobs without re-encoding', async () => {
    const blob = new Blob(['png'], { type: 'image/png' });
    await expect(convertImageBlobToPng(blob)).resolves.toBe(blob);
  });

  it('converts JPEG blobs to PNG', async () => {
    const close = vi.fn();
    const drawImage = vi.fn();
    const canvas = {
      width: 0,
      height: 0,
      getContext: vi.fn(() => ({ drawImage })),
      toBlob: vi.fn((callback: BlobCallback) => {
        callback(new Blob(['png'], { type: 'image/png' }));
      }),
    };
    vi.stubGlobal(
      'createImageBitmap',
      vi.fn(async () => ({ width: 12, height: 8, close })),
    );
    vi.stubGlobal('document', {
      createElement: vi.fn(() => canvas),
    });

    const result = await convertImageBlobToPng(new Blob(['jpeg'], { type: 'image/jpeg' }));

    expect(result.type).toBe('image/png');
    expect(canvas.width).toBe(12);
    expect(canvas.height).toBe(8);
    expect(drawImage).toHaveBeenCalledOnce();
    expect(close).toHaveBeenCalledOnce();
  });

  it('writes PNG data to the image clipboard', async () => {
    const write = vi.fn(async () => undefined);
    const clipboardItems: Array<Record<string, Promise<Blob>>> = [];

    class ClipboardItemMock {
      constructor(items: Record<string, Promise<Blob>>) {
        clipboardItems.push(items);
      }
    }

    vi.stubGlobal('navigator', { clipboard: { write } });
    vi.stubGlobal('ClipboardItem', ClipboardItemMock);

    await copyImageBlobToClipboard(new Blob(['png'], { type: 'image/png' }));

    expect(write).toHaveBeenCalledOnce();
    expect(await clipboardItems[0]?.['image/png']).toBeInstanceOf(Blob);
  });
});
