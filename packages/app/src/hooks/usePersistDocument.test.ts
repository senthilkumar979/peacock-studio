import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { usePersistDocument } from './usePersistDocument';

const storeState = {
  documentId: 'doc-1' as string | null,
  isLoaded: true,
  flow: { id: 'f1' },
  steps: [{ id: 's1' }],
  screenshotUrls: {},
  stepResources: [] as unknown[],
  setDocumentId: vi.fn(),
};

vi.mock('@/analytics/analyticsClient', () => ({
  trackDocumentFirstSaved: vi.fn(),
}));

vi.mock('@/services/flowLibraryService', () => ({
  persistCurrentFlow: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@/utils/notify', () => ({
  notifyPersistError: vi.fn(),
}));

vi.mock('@/store/flowStore', () => ({
  useFlowStore: Object.assign(
    vi.fn((selector: (s: typeof storeState) => unknown) => selector(storeState)),
    {
      getState: () => storeState,
    },
  ),
}));

import { trackDocumentFirstSaved } from '@/analytics/analyticsClient';
import { persistCurrentFlow } from '@/services/flowLibraryService';
import { notifyPersistError } from '@/utils/notify';

describe('usePersistDocument', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    storeState.documentId = 'doc-1';
    storeState.isLoaded = true;
    storeState.flow = { id: 'f1' };
    storeState.setDocumentId.mockClear();
    vi.mocked(persistCurrentFlow).mockReset();
    vi.mocked(persistCurrentFlow).mockResolvedValue(undefined);
    vi.mocked(trackDocumentFirstSaved).mockClear();
    vi.mocked(notifyPersistError).mockClear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('sets document id from route when store id missing', () => {
    storeState.documentId = null;
    renderHook(() => usePersistDocument(true, 'route-doc'));
    expect(storeState.setDocumentId).toHaveBeenCalledWith('route-doc');
  });

  it('debounces persist and tracks first save', async () => {
    renderHook(() => usePersistDocument(true, 'doc-1'));
    await act(async () => {
      vi.advanceTimersByTime(1500);
      await Promise.resolve();
    });
    expect(persistCurrentFlow).toHaveBeenCalledWith('doc-1');
    expect(trackDocumentFirstSaved).toHaveBeenCalled();
  });

  it('notifies on persist errors', async () => {
    vi.mocked(persistCurrentFlow).mockRejectedValue(new Error('disk'));
    renderHook(() => usePersistDocument(true));
    await act(async () => {
      vi.advanceTimersByTime(1500);
      await Promise.resolve();
    });
    expect(notifyPersistError).toHaveBeenCalled();
  });
});
