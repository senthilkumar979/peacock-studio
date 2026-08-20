import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useRouteLibrary } from './useRouteLibrary';

vi.mock('@/services/routeLibraryService', () => ({
  listRouteSummaries: vi.fn(),
  deleteRoute: vi.fn(),
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

import { deleteRoute, listRouteSummaries } from '@/services/routeLibraryService';

describe('useRouteLibrary', () => {
  beforeEach(() => {
    vi.mocked(listRouteSummaries).mockReset();
    vi.mocked(deleteRoute).mockReset();
  });

  it('loads route summaries', async () => {
    vi.mocked(listRouteSummaries).mockResolvedValue([{ id: 'r1' }] as never);
    const { result } = renderHook(() => useRouteLibrary());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.summaries).toEqual([{ id: 'r1' }]);
  });

  it('captures list errors', async () => {
    vi.mocked(listRouteSummaries).mockRejectedValue(new Error('fail'));
    const { result } = renderHook(() => useRouteLibrary());
    await waitFor(() => expect(result.current.error).toBe('fail'));
  });

  it('deletes by id then refreshes', async () => {
    vi.mocked(listRouteSummaries).mockResolvedValue([]);
    vi.mocked(deleteRoute).mockResolvedValue(undefined);
    const { result } = renderHook(() => useRouteLibrary());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    await act(async () => {
      await result.current.deleteRouteById('r1');
    });
    expect(deleteRoute).toHaveBeenCalledWith('r1');
  });
});
