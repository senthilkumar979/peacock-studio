import { describe, expect, it } from 'vitest';
import { PLATFORM_COMPARISON } from './platformComparisonData';

describe('platformComparisonData', () => {
  it('exports comparison table structure', () => {
    const { comparisonTable, whenPeacockFitsBest } = PLATFORM_COMPARISON;
    expect(comparisonTable.title).toMatch(/peacock/i);
    expect(comparisonTable.columns.length).toBeGreaterThanOrEqual(4);
    expect(comparisonTable.rows.length).toBeGreaterThan(0);
    expect(whenPeacockFitsBest.signals.length).toBeGreaterThan(0);
  });
});
