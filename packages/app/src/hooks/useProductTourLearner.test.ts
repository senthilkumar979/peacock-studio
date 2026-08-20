import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getActiveFeatureIndex, useProductTourLearner } from './useProductTourLearner';
import type { ProductTour } from '@/types/productTour';

vi.mock('@/utils/productTourLearner', () => ({
  buildTourDemoMeta: vi.fn(),
  buildTourLearnerSegments: vi.fn((meta: unknown[][]) => {
    if (!meta.length) return [];
    return [
      { type: 'feature', featureIndex: 0 },
      { type: 'demo', featureIndex: 0, demoIndex: 0 },
      { type: 'complete' },
    ];
  }),
}));

vi.mock('@/utils/createProductTour', () => ({
  sortTourFeatures: vi.fn((features: unknown[]) => features),
}));

import { buildTourDemoMeta } from '@/utils/productTourLearner';

const tour: ProductTour = {
  id: 't1',
  title: 'Tour',
  description: '',
  status: 'live',
  personaId: 'p',
  tourGoal: '',
  features: [
    {
      id: 'f1',
      title: 'F',
      description: '',
      order: 0,
      demos: [{ id: 'd1', documentId: 'doc', order: 0 }],
    },
  ],
  createdAt: 1,
  updatedAt: 2,
};

describe('useProductTourLearner', () => {
  beforeEach(() => {
    vi.mocked(buildTourDemoMeta).mockReset();
    vi.mocked(buildTourDemoMeta).mockResolvedValue([
      [{ stepCount: 2, documentTitle: 'Doc' }],
    ] as never);
  });

  it('loads demo meta and navigates segments', async () => {
    const { result } = renderHook(() => useProductTourLearner(tour));
    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.segments).toHaveLength(3);
    expect(result.current.stepCounts).toEqual([[2]]);

    act(() => {
      result.current.goNext();
    });
    expect(result.current.currentIndex).toBe(1);

    act(() => {
      result.current.setCurrentIndex(2);
    });
    expect(result.current.isAtComplete).toBe(true);

    act(() => {
      result.current.goPrevious();
      result.current.replay();
    });
    expect(result.current.currentIndex).toBe(0);
  });

  it('does not load when tour is null', () => {
    renderHook(() => useProductTourLearner(null));
    expect(buildTourDemoMeta).not.toHaveBeenCalled();
  });
});

describe('getActiveFeatureIndex', () => {
  it('reads featureIndex from segment', () => {
    expect(getActiveFeatureIndex(tour, { type: 'demo', featureIndex: 0, demoIndex: 0 } as never)).toBe(
      0,
    );
    expect(getActiveFeatureIndex(tour, { type: 'complete' } as never)).toBe(0);
  });
});
