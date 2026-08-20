import { describe, expect, it } from 'vitest';
import { buildScrollStops } from './scrollStops';

describe('buildScrollStops', () => {
  it('returns a single stop when content fits in the viewport', () => {
    expect(buildScrollStops(500, 800)).toEqual([0]);
    expect(buildScrollStops(800, 800)).toEqual([0]);
  });

  it('walks the page in viewport-sized increments', () => {
    expect(buildScrollStops(2500, 1000)).toEqual([0, 1000, 1500]);
  });

  it('deduplicates the final max scroll stop', () => {
    expect(buildScrollStops(2000, 1000)).toEqual([0, 1000]);
  });
});
