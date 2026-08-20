import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { SavedFlowSummary } from '@/types/savedFlow';
import { filterSummaries, getGreeting, sortSummaries } from './dashboardLibrary';

function summary(
  partial: Partial<SavedFlowSummary> & Pick<SavedFlowSummary, 'id'>,
): SavedFlowSummary {
  return {
    title: partial.title ?? partial.id,
    description: partial.description ?? '',
    version: partial.version ?? '1.0.0',
    status: partial.status ?? 'live',
    generatedAt: partial.generatedAt ?? 0,
    updatedAt: partial.updatedAt ?? 0,
    stepCount: partial.stepCount ?? 0,
    ...partial,
  };
}

describe('filterSummaries', () => {
  const items = [
    summary({
      id: '1',
      title: 'Onboarding',
      description: '<p>HR path</p>',
      version: '1.0.0',
      status: 'live',
    }),
    summary({
      id: '2',
      title: 'Payroll',
      description: 'Finance',
      version: '2.0.0',
      status: 'draft',
    }),
  ];

  it('filters by status and free-text haystack', () => {
    expect(filterSummaries(items, '', 'draft').map((i) => i.id)).toEqual(['2']);
    expect(filterSummaries(items, 'hr', 'all').map((i) => i.id)).toEqual(['1']);
    expect(filterSummaries(items, '2.0', 'all').map((i) => i.id)).toEqual(['2']);
    expect(filterSummaries(items, '  ', 'all')).toHaveLength(2);
  });
});

describe('sortSummaries', () => {
  const items = [
    summary({ id: 'a', title: 'Beta', generatedAt: 2, stepCount: 1 }),
    summary({ id: 'b', title: 'Alpha', generatedAt: 1, stepCount: 5 }),
    summary({ id: 'c', title: 'Gamma', generatedAt: 3, stepCount: 5 }),
  ];

  it('sorts by newest, oldest, mostSteps, and title', () => {
    expect(sortSummaries(items, 'newest').map((i) => i.id)).toEqual(['c', 'a', 'b']);
    expect(sortSummaries(items, 'oldest').map((i) => i.id)).toEqual(['b', 'a', 'c']);
    expect(sortSummaries(items, 'mostSteps').map((i) => i.id)).toEqual(['c', 'b', 'a']);
    expect(sortSummaries(items, 'title').map((i) => i.id)).toEqual(['b', 'a', 'c']);
  });
});

describe('getGreeting', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns morning / afternoon / evening by hour', () => {
    vi.setSystemTime(new Date(2026, 0, 1, 8));
    expect(getGreeting()).toBe('Good morning');
    vi.setSystemTime(new Date(2026, 0, 1, 13));
    expect(getGreeting()).toBe('Good afternoon');
    vi.setSystemTime(new Date(2026, 0, 1, 20));
    expect(getGreeting()).toBe('Good evening');
  });
});
