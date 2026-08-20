import { describe, expect, it } from 'vitest';
import { normalizeProductTour } from './normalizeProductTour';

describe('normalizeProductTour', () => {
  it('defaults missing tourGoal to empty string', () => {
    const tour = normalizeProductTour({
      id: 't1',
      title: 'Tour',
      description: '',
      status: 'draft',
      personaId: 'p1',
      features: [],
      createdAt: 1,
      updatedAt: 2,
    } as unknown as Parameters<typeof normalizeProductTour>[0]);

    expect(tour.tourGoal).toBe('');
  });

  it('preserves existing tourGoal', () => {
    expect(
      normalizeProductTour({
        id: 't1',
        title: 'Tour',
        description: '',
        status: 'live',
        personaId: 'p1',
        tourGoal: 'Learn billing',
        features: [],
        createdAt: 1,
        updatedAt: 2,
      }).tourGoal,
    ).toBe('Learn billing');
  });
});
