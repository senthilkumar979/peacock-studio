import { beforeEach, describe, expect, it, vi } from 'vitest';
import { db } from '../storage/db';
import {
  cropVisibleCapture,
  openCaptureResult,
  stitchFullPageCaptures,
} from './captureResult';

describe('captureResult', () => {
  beforeEach(async () => {
    await db.delete();
    await db.open();

    vi.stubGlobal(
      'createImageBitmap',
      vi.fn(async () => ({
        width: 200,
        height: 100,
        close: vi.fn(),
      })),
    );

    class MockOffscreenCanvas {
      width: number;
      height: number;
      constructor(width: number, height: number) {
        this.width = width;
        this.height = height;
      }
      getContext() {
        return {
          drawImage: vi.fn(),
          clearRect: vi.fn(),
        };
      }
      convertToBlob() {
        return Promise.resolve(new Blob(['out'], { type: 'image/png' }));
      }
    }

    vi.stubGlobal('OffscreenCanvas', MockOffscreenCanvas);
    (chrome.tabs.create as ReturnType<typeof vi.fn>).mockResolvedValue({} as chrome.tabs.Tab);
  });

  it('crops a visible selection into a blob', async () => {
    const blob = await cropVisibleCapture(new Blob(['src']), {
      left: 10,
      top: 20,
      width: 50,
      height: 40,
      viewportWidth: 100,
      viewportHeight: 100,
    });
    expect(blob.type).toBe('image/png');
  });

  it('stitches full-page slices', async () => {
    const blob = await stitchFullPageCaptures(
      [
        { blob: new Blob(['a']), scrollY: 0 },
        { blob: new Blob(['b']), scrollY: 50 },
      ],
      100,
      100,
    );
    expect(blob.type).toBe('image/png');
  });

  it('throws when stitching with no slices', async () => {
    await expect(stitchFullPageCaptures([], 100, 100)).rejects.toThrow(
      'No screenshot slices available',
    );
  });

  it('stores a capture and opens the screenshot page', async () => {
    await openCaptureResult(new Blob(['img'], { type: 'image/png' }), 'visible');
    expect(await db.captures.count()).toBe(1);
    expect(chrome.tabs.create).toHaveBeenCalledWith({
      url: expect.stringContaining('screenshot/index.html?captureId='),
    });
  });

  it('throws when the first stitched bitmap is missing', async () => {
    vi.stubGlobal(
      'createImageBitmap',
      vi.fn(async () => undefined),
    );

    await expect(
      stitchFullPageCaptures([{ blob: new Blob(['a']), scrollY: 0 }], 100, 100),
    ).rejects.toThrow('No screenshot slices available');
  });
});
