import { describe, expect, it } from 'vitest';
import {
  PAGE_EASE,
  pageTransitionTiming,
  pageTransitionVariants,
  shellFadeTiming,
} from './pageMotion';

describe('pageMotion', () => {
  it('exports opacity transition variants', () => {
    expect(pageTransitionVariants).toEqual({
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
    });
  });

  it('shares ease and duration across timings', () => {
    expect(PAGE_EASE).toEqual([0.22, 1, 0.36, 1]);
    expect(pageTransitionTiming.duration).toBe(0.28);
    expect(pageTransitionTiming.ease).toBe(PAGE_EASE);
    expect(shellFadeTiming).toEqual(pageTransitionTiming);
  });
});
