import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useFlowLibrary } from './useFlowLibrary';

vi.mock('@/hooks/useSessionMode', () => ({
  useSessionMode: vi.fn(() => 'cloud'),
}));

vi.mock('@/services/flowLibraryService', () => ({
  listFlowSummaries: vi.fn(),
  removeFlowDocument: vi.fn(),
  duplicateFlowDocument: vi.fn(),
}));

vi.mock('@/utils/dashboardStats', () => ({
  computeDashboardStats: vi.fn(() => ({ total: 0 })),
}));

vi.mock('@/utils/appError', () => ({
  reportAppError: vi.fn((_c: string, err: unknown) => ({
    title: 'Failed',
    userMessage: err instanceof Error ? err.message : String(err),
  })),
}));

vi.mock('@/utils/notify', () => ({
  notifyError: vi.fn(),
  notifyPromise: vi.fn(async (p: Promise<unknown>) => p),
}));

import {
  duplicateFlowDocument,
  listFlowSummaries,
  removeFlowDocument,
} from '@/services/flowLibraryService';
import { useSessionMode } from '@/hooks/useSessionMode';

describe('useFlowLibrary', () => {
  beforeEach(() => {
    vi.mocked(useSessionMode).mockReturnValue('cloud');
    vi.mocked(listFlowSummaries).mockReset();
    vi.mocked(removeFlowDocument).mockReset();
    vi.mocked(duplicateFlowDocument).mockReset();
  });

  it('loads summaries and stats', async () => {
    vi.mocked(listFlowSummaries).mockResolvedValue([{ id: 'd1' }] as never);
    const { result } = renderHook(() => useFlowLibrary());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.summaries).toEqual([{ id: 'd1' }]);
    expect(result.current.sessionMode).toBe('cloud');
  });

  it('skips load while session settling', () => {
    vi.mocked(useSessionMode).mockReturnValue('onboarding');
    renderHook(() => useFlowLibrary());
    expect(listFlowSummaries).not.toHaveBeenCalled();
  });

  it('deletes and duplicates when not guest', async () => {
    vi.mocked(listFlowSummaries).mockResolvedValue([]);
    vi.mocked(removeFlowDocument).mockResolvedValue(undefined);
    vi.mocked(duplicateFlowDocument).mockResolvedValue('new-id');
    const { result } = renderHook(() => useFlowLibrary());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.deleteDocument('d1');
      await result.current.duplicateDocument('d1');
    });
    expect(removeFlowDocument).toHaveBeenCalledWith('d1');
    expect(duplicateFlowDocument).toHaveBeenCalledWith('d1');
  });

  it('no-ops delete/duplicate for guests', async () => {
    vi.mocked(useSessionMode).mockReturnValue('guest');
    vi.mocked(listFlowSummaries).mockResolvedValue([]);
    const { result } = renderHook(() => useFlowLibrary());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    await act(async () => {
      await result.current.deleteDocument('d1');
      await result.current.duplicateDocument('d1');
    });
    expect(removeFlowDocument).not.toHaveBeenCalled();
    expect(duplicateFlowDocument).not.toHaveBeenCalled();
  });
});
