import { isInlineScreenshotUrl } from '@/cloud/screenshotUtils';

const prefetchedImages = new Map<string, HTMLImageElement>();
const inFlight = new Map<string, Promise<'loaded' | 'failed'>>();

export function isImagePrefetched(url: string): boolean {
  const img = prefetchedImages.get(url);
  return Boolean(img?.complete && img.naturalWidth > 0);
}

export function clearPrefetchedImages(): void {
  prefetchedImages.clear();
  inFlight.clear();
}

export function prefetchImage(url: string): Promise<'loaded' | 'failed'> {
  if (!url || isInlineScreenshotUrl(url)) {
    return Promise.resolve('loaded');
  }

  if (isImagePrefetched(url)) {
    return Promise.resolve('loaded');
  }

  const existing = inFlight.get(url);
  if (existing) return existing;

  const promise = new Promise<'loaded' | 'failed'>((resolve) => {
    const img = new Image();
    img.onload = () => {
      prefetchedImages.set(url, img);
      inFlight.delete(url);
      resolve('loaded');
    };
    img.onerror = () => {
      inFlight.delete(url);
      resolve('failed');
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

export interface PrefetchImagesResult {
  loaded: string[];
  failed: string[];
}

export async function prefetchImages(
  urls: string[],
  options: PrefetchImagesOptions = {},
): Promise<PrefetchImagesResult> {
  const { concurrency = 6, priorityUrl, signal } = options;
  const loaded: string[] = [];
  const failed: string[] = [];

  const unique = [...new Set(urls.filter((url) => url && !isInlineScreenshotUrl(url)))];

  if (signal?.aborted) return { loaded, failed };

  async function loadOne(url: string): Promise<void> {
    if (signal?.aborted) return;
    const result = await prefetchImage(url);
    if (signal?.aborted) return;
    if (result === 'loaded') loaded.push(url);
    else failed.push(url);
  }

  if (priorityUrl && !isInlineScreenshotUrl(priorityUrl)) {
    await loadOne(priorityUrl);
  }

  if (signal?.aborted) return { loaded, failed };

  const remaining = priorityUrl ? unique.filter((url) => url !== priorityUrl) : unique;
  if (!remaining.length) return { loaded, failed };

  let index = 0;

  async function worker(): Promise<void> {
    while (index < remaining.length) {
      if (signal?.aborted) return;
      const url = remaining[index];
      index += 1;
      if (!url) continue;
      await loadOne(url);
    }
  }

  const workerCount = Math.min(concurrency, remaining.length);
  await Promise.all(Array.from({ length: workerCount }, () => worker()));
  return { loaded, failed };
}
