import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useSavedProductTour } from './useSavedProductTour';

const tourStore = {
  isLoaded: false,
  tour: null as { id: string } | null,
  hydrateFromTour: vi.fn(),
  resetTour: vi.fn(),
};

vi.mock('@/services/productTourLibraryService', () => ({
  getProductTour: vi.fn(),
}));

vi.mock('@/store/productTourBuilderStore', () => ({
  useProductTourBuilderStore: vi.fn((selector: (s: typeof tourStore) => unknown) => selector(tourStore)),
}));

import { getProductTour } from '@/services/productTourLibraryService';

describe('useSavedProductTour', () => {
  beforeEach(() => {
    tourStore.isLoaded = false;
    tourStore.tour = null;
    tourStore.hydrateFromTour.mockClear();
    tourStore.resetTour.mockClear();
    vi.mocked(getProductTour).mockReset();
  });

  it('errors when tour id missing', () => {
    const { result } = renderHook(() => useSavedProductTour(undefined));
    expect(result.current.error).toBe('Missing tour id.');
    expect(result.current.isLoading).toBe(false);
  });

  it('hydrates from fetched tour', async () => {
    vi.mocked(getProductTour).mockResolvedValue({ id: 't1', title: 'Tour' } as never);
    const { result } = renderHook(() => useSavedProductTour('t1'));
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(tourStore.hydrateFromTour).toHaveBeenCalledWith({ id: 't1', title: 'Tour' });
  });

  it('reports not found', async () => {
    vi.mocked(getProductTour).mockResolvedValue(undefined);
    const { result } = renderHook(() => useSavedProductTour('missing'));
    await waitFor(() => expect(result.current.error).toMatch(/not found/));
  });

  it('skips fetch when already loaded for same id', () => {
    tourStore.isLoaded = true;
    tourStore.tour = { id: 't1' };
    const { result } = renderHook(() => useSavedProductTour('t1'));
    expect(result.current.isLoaded).toBe(true);
    expect(getProductTour).not.toHaveBeenCalled();
  });

  it('resets when switching tours', async () => {
    tourStore.isLoaded = true;
    tourStore.tour = { id: 'old' };
    vi.mocked(getProductTour).mockResolvedValue({ id: 'new' } as never);
    renderHook(() => useSavedProductTour('new'));
    await waitFor(() => expect(tourStore.resetTour).toHaveBeenCalled());
  });
});
