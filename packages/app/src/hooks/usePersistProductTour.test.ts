import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { usePersistProductTour } from './usePersistProductTour';

vi.mock('@/services/productTourLibraryService', () => ({
  persistProductTour: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@/store/productTourBuilderStore', () => ({
  useProductTourBuilderStore: vi.fn(),
}));

import { persistProductTour } from '@/services/productTourLibraryService';
import { useProductTourBuilderStore } from '@/store/productTourBuilderStore';

describe('usePersistProductTour', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.mocked(persistProductTour).mockClear();
    vi.mocked(useProductTourBuilderStore).mockImplementation(((selector: (s: { tour: unknown }) => unknown) =>
      selector({ tour: { id: 't1' } })) as any);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('does nothing when disabled', () => {
    renderHook(() => usePersistProductTour(false));
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(persistProductTour).not.toHaveBeenCalled();
  });

  it('debounces persist when enabled', () => {
    renderHook(() => usePersistProductTour(true));
    act(() => {
      vi.advanceTimersByTime(1499);
    });
    expect(persistProductTour).not.toHaveBeenCalled();
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(persistProductTour).toHaveBeenCalledWith({ id: 't1' });
  });
});
