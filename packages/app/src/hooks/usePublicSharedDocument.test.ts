import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { usePublicSharedDocument } from './usePublicSharedDocument';

const flowStore = {
  isLoaded: false,
  documentId: null as string | null,
  setViewerFilter: vi.fn(),
};

vi.mock('@/services/flowLibraryService', () => ({
  loadFlowIntoStore: vi.fn(),
}));

vi.mock('@/storage/libraryRouter', () => ({
  getFlowDocument: vi.fn(),
}));

vi.mock('@/utils/appError', () => ({
  reportAppError: vi.fn(),
}));

vi.mock('@/store/flowStore', () => ({
  useFlowStore: vi.fn((selector: (s: typeof flowStore) => unknown) => selector(flowStore)),
}));

import { loadFlowIntoStore } from '@/services/flowLibraryService';
import { getFlowDocument } from '@/storage/libraryRouter';
import { reportAppError } from '@/utils/appError';

describe('usePublicSharedDocument', () => {
  beforeEach(() => {
    flowStore.isLoaded = false;
    flowStore.documentId = null;
    flowStore.setViewerFilter.mockClear();
    vi.mocked(getFlowDocument).mockReset();
    vi.mocked(loadFlowIntoStore).mockClear();
    vi.mocked(reportAppError).mockClear();
  });

  it('is not ready without a document share link', () => {
    const { result } = renderHook(() => usePublicSharedDocument(null));
    expect(result.current.isReady).toBe(false);
    expect(result.current.shareLinkViewMode).toBeNull();
  });

  it('loads document and applies share viewer filter', async () => {
    vi.mocked(getFlowDocument).mockResolvedValue({ id: 'doc-1' } as never);
    const link = {
      resourceType: 'document',
      resourceId: 'doc-1',
      settings: {
        viewMode: 'guide',
        shareSettings: {
          includeMainFlow: true,
          enabledPathIds: ['p1'],
          enabledBranchIds: ['b1'],
        },
      },
    } as never;

    const { result, rerender } = renderHook(() => usePublicSharedDocument(link));
    await waitFor(() => expect(loadFlowIntoStore).toHaveBeenCalled());
    expect(flowStore.setViewerFilter).toHaveBeenCalledWith(
      expect.objectContaining({
        includeMainFlow: true,
        enabledPathIds: expect.any(Set),
      }),
    );

    flowStore.isLoaded = true;
    flowStore.documentId = 'doc-1';
    rerender();
    expect(result.current.isReady).toBe(true);
    expect(result.current.shareLinkViewMode).toBe('guide');
  });

  it('reports load errors', async () => {
    vi.mocked(getFlowDocument).mockRejectedValue(new Error('boom'));
    renderHook(() =>
      usePublicSharedDocument({
        resourceType: 'document',
        resourceId: 'doc-1',
        settings: {},
      } as never),
    );
    await waitFor(() => expect(reportAppError).toHaveBeenCalled());
  });
});
