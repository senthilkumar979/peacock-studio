import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useSavedDocument } from './useSavedDocument';

const flowStore = {
  isLoaded: false,
  documentId: null as string | null,
  resetFlow: vi.fn(),
  setDocumentId: vi.fn(),
};

vi.mock('@/hooks/useSessionMode', () => ({
  useSessionMode: vi.fn(() => 'guest'),
}));

vi.mock('@/services/flowLibraryService', () => ({
  getFlowDocument: vi.fn(),
  loadFlowIntoStore: vi.fn(),
}));

vi.mock('@/utils/appError', () => ({
  reportAppError: vi.fn((context: string, err: unknown) => ({
    title: context,
    userMessage: err instanceof Error ? err.message : String(err),
  })),
}));

vi.mock('@/store/flowStore', () => ({
  useFlowStore: Object.assign(
    vi.fn((selector: (s: typeof flowStore) => unknown) => selector(flowStore)),
    { getState: () => flowStore },
  ),
}));

import { getFlowDocument, loadFlowIntoStore } from '@/services/flowLibraryService';
import { useSessionMode } from '@/hooks/useSessionMode';

describe('useSavedDocument', () => {
  beforeEach(() => {
    flowStore.isLoaded = false;
    flowStore.documentId = null;
    flowStore.resetFlow.mockClear();
    flowStore.setDocumentId.mockClear();
    vi.mocked(useSessionMode).mockReturnValue('guest');
    vi.mocked(getFlowDocument).mockReset();
    vi.mocked(loadFlowIntoStore).mockClear();
  });

  it('errors without document id', () => {
    const { result } = renderHook(() => useSavedDocument(undefined));
    expect(result.current.error).toBe('Missing document id.');
  });

  it('waits while session cannot load', () => {
    vi.mocked(useSessionMode).mockReturnValue('loading');
    const { result } = renderHook(() => useSavedDocument('doc-1'));
    expect(result.current.isLoading).toBe(true);
    expect(getFlowDocument).not.toHaveBeenCalled();
  });

  it('loads and hydrates a readable document', async () => {
    vi.mocked(getFlowDocument).mockResolvedValue({
      flow: { flow: { id: 'f' } },
      steps: [],
    } as never);
    const { result } = renderHook(() => useSavedDocument('doc-1'));
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(loadFlowIntoStore).toHaveBeenCalled();
  });

  it('reports not found', async () => {
    vi.mocked(getFlowDocument).mockResolvedValue(undefined);
    const { result } = renderHook(() => useSavedDocument('missing'));
    await waitFor(() => expect(result.current.error).toMatch(/not found/));
  });

  it('reports corrupt payloads', async () => {
    vi.mocked(getFlowDocument).mockResolvedValue({ flow: {}, steps: null } as never);
    const { result } = renderHook(() => useSavedDocument('bad'));
    await waitFor(() => expect(result.current.error).toBeTruthy());
  });

  it('assigns document id when store loaded without id', () => {
    flowStore.isLoaded = true;
    flowStore.documentId = null;
    const { result } = renderHook(() => useSavedDocument('doc-1'));
    expect(flowStore.setDocumentId).toHaveBeenCalledWith('doc-1');
    expect(result.current.isLoading).toBe(false);
  });
});
