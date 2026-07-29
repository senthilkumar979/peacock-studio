import { isInlineScreenshotUrl } from '@/cloud/screenshotUtils';

const prefetchedImages = new Map<string, HTMLImageElement>();
const inFlight = new Map<string, Promise<void>>();

export function isImagePrefetched(url: string): boolean {
  const img = prefetchedImages.get(url);
  return Boolean(img?.complete && img.naturalWidth > 0);
}

export function clearPrefetchedImages(): void {
  prefetchedImages.clear();
  inFlight.clear();
}

export function prefetchImage(url: string): Promise<void> {
  if (!url || isInlineScreenshotUrl(url)) {
    return Promise.resolve();
  }

  if (isImagePrefetched(url)) {
    return Promise.resolve();
  }

  const existing = inFlight.get(url);
  if (existing) return existing;

  const promise = new Promise<void>((resolve) => {
    const img = new Image();
    img.onload = () => {
      prefetchedImages.set(url, img);
      inFlight.delete(url);
      resolve();
    };
    img.onerror = () => {
      inFlight.delete(url);
      resolve();
    };
    img.src = url;
  });

  inFlight.set(url, promise);
  return promise;
}

export interface PrefetchImagesOptions {
  concurrency?: number;
  priorityUrl?: string | null;
  signal?: AbortSignal;
}

export async function prefetchImages(
  urls: string[],
  options: PrefetchImagesOptions = {},
): Promise<void> {
  const { concurrency = 6, priorityUrl, signal } = options;

  const unique = [...new Set(urls.filter((url) => url && !isInlineScreenshotUrl(url)))];

  if (signal?.aborted) return;

  if (priorityUrl && !isInlineScreenshotUrl(priorityUrl)) {
    await prefetchImage(priorityUrl);
  }

  if (signal?.aborted) return;

  const remaining = priorityUrl ? unique.filter((url) => url !== priorityUrl) : unique;
  if (!remaining.length) return;

  let index = 0;

  async function worker(): Promise<void> {
    while (index < remaining.length) {
      if (signal?.aborted) return;
      const url = remaining[index];
      index += 1;
      if (!url) continue;
      await prefetchImage(url);
    }
  }

  const workerCount = Math.min(concurrency, remaining.length);
  await Promise.all(Array.from({ length: workerCount }, () => worker()));
}
