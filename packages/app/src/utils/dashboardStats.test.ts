import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { SavedFlowSummary } from '@/types/savedFlow';
import { computeDashboardStats } from './dashboardStats';

function summary(
  partial: Partial<SavedFlowSummary> & Pick<SavedFlowSummary, 'id' | 'generatedAt' | 'stepCount'>,
): SavedFlowSummary {
  return {
    title: partial.id,
    description: '',
    version: '1.0.0',
    status: 'live',
    updatedAt: partial.generatedAt,
    ...partial,
  };
}

describe('computeDashboardStats', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // Wednesday 2026-01-14 — week starts Monday 2026-01-12
    vi.setSystemTime(new Date(2026, 0, 14, 15, 0, 0));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns zeros for empty library', () => {
    expect(computeDashboardStats([])).toEqual({
      totalDocuments: 0,
      totalThisWeek: 0,
      totalThisMonth: 0,
      totalStepsDocumented: 0,
      averageStepsPerDocument: 0,
    });
  });

  it('counts week/month docs and averages steps', () => {
    const weekStart = new Date(2026, 0, 12).getTime();
    const monthStart = new Date(2026, 0, 1).getTime();
    const lastMonth = new Date(2025, 11, 20).getTime();

    const stats = computeDashboardStats([
      summary({ id: 'a', generatedAt: weekStart + 1, stepCount: 10 }),
      summary({ id: 'b', generatedAt: monthStart + 1, stepCount: 5 }),
      summary({ id: 'c', generatedAt: lastMonth, stepCount: 1 }),
    ]);

    expect(stats.totalDocuments).toBe(3);
    expect(stats.totalThisWeek).toBe(1);
    expect(stats.totalThisMonth).toBe(2);
    expect(stats.totalStepsDocumented).toBe(16);
    expect(stats.averageStepsPerDocument).toBe(5.3);
  });
});
