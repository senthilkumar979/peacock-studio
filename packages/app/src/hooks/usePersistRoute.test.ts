import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { usePersistRoute } from './usePersistRoute';

vi.mock('@/services/routeLibraryService', () => ({
  persistRoute: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@/utils/notify', () => ({
  notifyPersistError: vi.fn(),
}));

vi.mock('@/store/routeBuilderStore', () => ({
  useRouteBuilderStore: vi.fn(),
}));

import { persistRoute } from '@/services/routeLibraryService';
import { useRouteBuilderStore } from '@/store/routeBuilderStore';
import { notifyPersistError } from '@/utils/notify';

describe('usePersistRoute', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.mocked(persistRoute).mockReset();
    vi.mocked(persistRoute).mockResolvedValue(undefined);
    vi.mocked(useRouteBuilderStore).mockImplementation(((selector: (s: { route: unknown; isLoaded: boolean }) => unknown) =>
      selector({ route: { id: 'r1' }, isLoaded: true })) as any);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('persists after debounce when loaded', async () => {
    renderHook(() => usePersistRoute(true));
    await act(async () => {
      vi.advanceTimersByTime(1500);
    });
    expect(persistRoute).toHaveBeenCalledWith({ id: 'r1' });
  });

  it('notifies on persist failure', async () => {
    vi.mocked(persistRoute).mockRejectedValue(new Error('save failed'));
    renderHook(() => usePersistRoute(true));
    await act(async () => {
      vi.advanceTimersByTime(1500);
      await Promise.resolve();
    });
    expect(notifyPersistError).toHaveBeenCalled();
  });

  it('skips when not loaded', async () => {
    vi.mocked(useRouteBuilderStore).mockImplementation(((selector: (s: { route: unknown; isLoaded: boolean }) => unknown) =>
      selector({ route: { id: 'r1' }, isLoaded: false })) as any);
    renderHook(() => usePersistRoute(true));
    await act(async () => {
      vi.advanceTimersByTime(2000);
    });
    expect(persistRoute).not.toHaveBeenCalled();
  });
});
