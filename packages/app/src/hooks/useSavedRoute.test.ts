import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useSavedRoute } from './useSavedRoute';

const routeStore = {
  route: null as { id: string } | null,
  isLoaded: false,
  hydrateFromRoute: vi.fn(),
  resetRoute: vi.fn(),
};

vi.mock('@/services/routeLibraryService', () => ({
  getRoute: vi.fn(),
}));

vi.mock('@/store/routeBuilderStore', () => ({
  useRouteBuilderStore: vi.fn((selector: (s: typeof routeStore) => unknown) => selector(routeStore)),
}));

import { getRoute } from '@/services/routeLibraryService';

describe('useSavedRoute', () => {
  beforeEach(() => {
    routeStore.route = null;
    routeStore.isLoaded = false;
    routeStore.hydrateFromRoute.mockClear();
    routeStore.resetRoute.mockClear();
    vi.mocked(getRoute).mockReset();
  });

  it('errors without route id', () => {
    const { result } = renderHook(() => useSavedRoute(undefined));
    expect(result.current.error).toBe('Missing route id.');
  });

  it('hydrates found routes', async () => {
    vi.mocked(getRoute).mockResolvedValue({ id: 'r1' } as never);
    const { result } = renderHook(() => useSavedRoute('r1'));
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(routeStore.hydrateFromRoute).toHaveBeenCalledWith({ id: 'r1' });
  });

  it('errors when route missing', async () => {
    vi.mocked(getRoute).mockResolvedValue(undefined);
    const { result } = renderHook(() => useSavedRoute('gone'));
    await waitFor(() => expect(result.current.error).toMatch(/not found/));
  });

  it('resets when switching route ids', async () => {
    routeStore.isLoaded = true;
    routeStore.route = { id: 'old' };
    vi.mocked(getRoute).mockResolvedValue({ id: 'new' } as never);
    renderHook(() => useSavedRoute('new'));
    await waitFor(() => expect(routeStore.resetRoute).toHaveBeenCalled());
  });
});
