import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ProductTour } from '@/types/productTour';
import { estimateTourDurationMinutes, getTourDemoDisplayTitle } from './productTourLearner';

vi.mock('@/services/flowLibraryService', () => ({
  getFlowDocument: vi.fn(),
}));

import { getFlowDocument } from '@/services/flowLibraryService';

function tour(demos: Array<{ documentId: string }>): ProductTour {
  return {
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
        demos: demos.map((demo, order) => ({ id: `d${order}`, order, ...demo })),
      },
    ],
    createdAt: 1,
    updatedAt: 2,
  };
}

describe('getTourDemoDisplayTitle', () => {
  it('prefers document title, then label, then Demo N', () => {
    expect(getTourDemoDisplayTitle({ label: 'Label' }, { documentTitle: ' Doc ' }, 0)).toBe(
      'Doc',
    );
    expect(getTourDemoDisplayTitle({ label: ' Label ' }, { documentTitle: '  ' }, 0)).toBe(
      'Label',
    );
    expect(getTourDemoDisplayTitle({}, undefined, 2)).toBe('Demo 3');
  });
});

describe('estimateTourDurationMinutes', () => {
  beforeEach(() => {
    vi.mocked(getFlowDocument).mockReset();
  });

  it('returns null when tour has no demos', async () => {
    await expect(estimateTourDurationMinutes(tour([]))).resolves.toBeNull();
  });

  it('estimates minutes from playable step count', async () => {
    vi.mocked(getFlowDocument).mockResolvedValue({
      steps: [
        { id: 's1', title: 'A', notes: '', generatedTitle: '', generatedDescription: '', screenshotId: '', event: {} },
        { id: 's2', title: 'B', notes: '', generatedTitle: '', generatedDescription: '', screenshotId: '', event: {} },
      ],
    } as Awaited<ReturnType<typeof getFlowDocument>>);

    // 2 steps * 30s = 60s → 1 minute
    await expect(estimateTourDurationMinutes(tour([{ documentId: 'doc-1' }]))).resolves.toBe(1);
  });
});
