import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { usePrefetchFlowScreenshots } from './usePrefetchFlowScreenshots';

const flowStore = {
  documentId: 'doc-1' as string | null,
  steps: [] as unknown[],
  viewerFilter: null,
  screenshotUrls: {} as Record<string, string>,
};

vi.mock('@peacock/shared', async () => {
  const actual = await vi.importActual<typeof import('@peacock/shared')>('@peacock/shared');
  return {
    ...actual,
    getPlayableSteps: vi.fn((steps: unknown[]) => steps),
    getStepScreenshotUrl: vi.fn((step: { id: string }, urls: Record<string, string>) => urls[step.id] ?? null),
  };
});

vi.mock('@/cloud/screenshotUtils', () => ({
  isInlineScreenshotUrl: vi.fn((url: string) => url.startsWith('data:')),
}));

vi.mock('@/utils/flowShareSettings', () => ({
  filterOutlineForViewer: vi.fn((steps: unknown[]) => steps),
}));

vi.mock('@/utils/prefetchImages', () => ({
  clearPrefetchedImages: vi.fn(),
  isImagePrefetched: vi.fn(() => false),
  prefetchImages: vi.fn().mockResolvedValue({ loaded: [], failed: [] }),
}));

vi.mock('@/store/flowStore', () => ({
  useFlowStore: vi.fn((selector: (s: typeof flowStore) => unknown) => selector(flowStore)),
}));

import { clearPrefetchedImages, prefetchImages } from '@/utils/prefetchImages';

describe('usePrefetchFlowScreenshots', () => {
  beforeEach(() => {
    flowStore.documentId = 'doc-1';
    flowStore.steps = [];
    flowStore.screenshotUrls = {};
    vi.mocked(prefetchImages).mockClear();
    vi.mocked(clearPrefetchedImages).mockClear();
  });

  it('marks ready when disabled', () => {
    const { result } = renderHook(() => usePrefetchFlowScreenshots('doc-1', false));
    expect(result.current.areScreenshotsReady).toBe(true);
  });

  it('marks ready when no urls to prefetch', () => {
    const { result } = renderHook(() => usePrefetchFlowScreenshots('doc-1', true));
    expect(result.current.areScreenshotsReady).toBe(true);
  });

  it('prefetches remote urls until complete', async () => {
    flowStore.steps = [{ id: 's1' }];
    flowStore.screenshotUrls = { s1: 'https://cdn/img.png' };
    vi.mocked(prefetchImages).mockResolvedValueOnce({
      loaded: ['https://cdn/img.png'],
      failed: [],
    });
    const { result } = renderHook(() => usePrefetchFlowScreenshots('doc-1', true));
    await waitFor(() => expect(prefetchImages).toHaveBeenCalled());
    await waitFor(() => expect(result.current.areScreenshotsReady).toBe(true));
    expect(result.current.screenshotsNetworkBlocked).toBe(false);
  });

  it('flags corporate network block when cloud screenshots all fail', async () => {
    const url = 'https://peacockstudio.app/storage/images/a/b/c.png?token=1';
    flowStore.steps = [{ id: 's1' }];
    flowStore.screenshotUrls = { s1: url };
    vi.mocked(prefetchImages).mockResolvedValueOnce({
      loaded: [],
      failed: [url],
    });
    const { result } = renderHook(() => usePrefetchFlowScreenshots('doc-1', true));
    await waitFor(() => expect(result.current.areScreenshotsReady).toBe(true));
    expect(result.current.screenshotsNetworkBlocked).toBe(true);
  });
});
