import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  clearPrefetchedImages,
  isImagePrefetched,
  prefetchImage,
  prefetchImages,
} from './prefetchImages';

interface MockImage {
  onload: (() => void) | null;
  onerror: (() => void) | null;
  complete: boolean;
  naturalWidth: number;
  currentSrc: string;
}

const createdImages: MockImage[] = [];

function installImageMock(onAssign?: (image: MockImage, value: string) => void): void {
  vi.stubGlobal(
    'Image',
    vi.fn(() => {
      const image: MockImage = {
        onload: null,
        onerror: null,
        complete: false,
        naturalWidth: 0,
        currentSrc: '',
      };

      Object.defineProperty(image, 'src', {
        set(value: string) {
          image.currentSrc = value;
          image.complete = false;
          image.naturalWidth = 0;
          queueMicrotask(() => {
            if (onAssign) {
              onAssign(image, value);
              return;
            }
            if (value.startsWith('fail://')) {
              image.onerror?.();
              return;
            }
            if (value.startsWith('data:') || value.startsWith('blob:')) {
              return;
            }
            image.complete = true;
            image.naturalWidth = 120;
            image.onload?.();
          });
        },
        get() {
          return image.currentSrc;
        },
      });

      createdImages.push(image);
      return image;
    }),
  );
}

describe('prefetchImages', () => {
  beforeEach(() => {
    clearPrefetchedImages();
    createdImages.length = 0;
    installImageMock();
  });

  afterEach(() => {
    clearPrefetchedImages();
    vi.unstubAllGlobals();
  });

  it('marks remote URLs as prefetched after load', async () => {
    const url = 'https://example.com/storage/images/a/b/c.png?token=abc';

    await prefetchImage(url);

    expect(isImagePrefetched(url)).toBe(true);
  });

  it('dedupes URLs and skips inline data URLs', async () => {
    const remote = 'https://example.com/storage/images/a/b/1.png?token=abc';
    const dataUrl = 'data:image/png;base64,abc';

    await prefetchImages([remote, remote, dataUrl]);

    expect(isImagePrefetched(remote)).toBe(true);
    expect(isImagePrefetched(dataUrl)).toBe(false);
    expect(createdImages).toHaveLength(1);
  });

  it('prefetches the priority URL first', async () => {
    const first = 'https://example.com/storage/images/a/b/1.png?token=1';
    const second = 'https://example.com/storage/images/a/b/2.png?token=2';
    const order: string[] = [];

    installImageMock((image, value) => {
      order.push(value);
      image.complete = true;
      image.naturalWidth = 120;
      image.onload?.();
    });

    await prefetchImages([first, second], { priorityUrl: second, concurrency: 1 });

    expect(order[0]).toBe(second);
    expect(isImagePrefetched(first)).toBe(true);
    expect(isImagePrefetched(second)).toBe(true);
  });

  it('does not throw when an image fails to load', async () => {
    const url = 'fail://example.com/missing.png';

    await expect(prefetchImage(url)).resolves.toBe('failed');
    expect(isImagePrefetched(url)).toBe(false);
  });

  it('reports failed urls from prefetchImages', async () => {
    const ok = 'https://example.com/storage/images/a/b/ok.png?token=1';
    const bad = 'fail://example.com/missing.png';

    const result = await prefetchImages([ok, bad]);

    expect(result.loaded).toEqual([ok]);
    expect(result.failed).toEqual([bad]);
  });

  it('clears prefetched images', async () => {
    const url = 'https://example.com/storage/images/a/b/c.png?token=abc';
    await prefetchImage(url);

    clearPrefetchedImages();

    expect(isImagePrefetched(url)).toBe(false);
  });
});
