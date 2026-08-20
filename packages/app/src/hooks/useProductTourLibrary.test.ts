import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useProductTourLibrary } from './useProductTourLibrary';

vi.mock('@/hooks/useSessionMode', () => ({
  useSessionMode: vi.fn(() => 'cloud'),
}));

vi.mock('@/services/productTourLibraryService', () => ({
  listProductTourSummaries: vi.fn(),
  deleteProductTour: vi.fn(),
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

import { deleteProductTour, listProductTourSummaries } from '@/services/productTourLibraryService';
import { useSessionMode } from '@/hooks/useSessionMode';

describe('useProductTourLibrary', () => {
  beforeEach(() => {
    vi.mocked(useSessionMode).mockReturnValue('cloud');
    vi.mocked(listProductTourSummaries).mockReset();
    vi.mocked(deleteProductTour).mockReset();
  });

  it('loads summaries when session can load', async () => {
    vi.mocked(listProductTourSummaries).mockResolvedValue([{ id: 't1' }] as never);
    const { result } = renderHook(() => useProductTourLibrary());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.summaries).toEqual([{ id: 't1' }]);
  });

  it('does not load while session settling', () => {
    vi.mocked(useSessionMode).mockReturnValue('connecting');
    renderHook(() => useProductTourLibrary());
    expect(listProductTourSummaries).not.toHaveBeenCalled();
  });

  it('surfaces list errors', async () => {
    vi.mocked(listProductTourSummaries).mockRejectedValue(new Error('down'));
    const { result } = renderHook(() => useProductTourLibrary());
    await waitFor(() => expect(result.current.error).toBe('down'));
  });

  it('deletes tours except in guest mode', async () => {
    vi.mocked(listProductTourSummaries).mockResolvedValue([]);
    vi.mocked(deleteProductTour).mockResolvedValue(undefined);
    const { result } = renderHook(() => useProductTourLibrary());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.deleteTourById('t1');
    });
    expect(deleteProductTour).toHaveBeenCalledWith('t1');

    vi.mocked(useSessionMode).mockReturnValue('guest');
    const guest = renderHook(() => useProductTourLibrary());
    await act(async () => {
      await guest.result.current.deleteTourById('t1');
    });
  });
});
