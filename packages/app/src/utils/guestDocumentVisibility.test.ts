import { describe, expect, it } from 'vitest';
import type { SavedFlowSummary } from '@/types/savedFlow';
import {
  countHiddenGuestDocuments,
  filterGuestVisibleSummaries,
  getGuestVisibleDocumentIds,
  isGuestVisibleDocumentId,
  sortSummariesByOldestUpdated,
} from './guestDocumentVisibility';

function summary(partial: Partial<SavedFlowSummary> & Pick<SavedFlowSummary, 'id'>): SavedFlowSummary {
  return {
    title: partial.title ?? partial.id,
    description: '',
    version: '1.0.0',
    status: 'live',
    generatedAt: partial.generatedAt ?? 0,
    updatedAt: partial.updatedAt ?? 0,
    stepCount: partial.stepCount ?? 0,
    ...partial,
  };
}

const docs = [
  summary({ id: 'new', updatedAt: 300 }),
  summary({ id: 'old', updatedAt: 100 }),
  summary({ id: 'mid', updatedAt: 200 }),
];

describe('guestDocumentVisibility', () => {
  it('sorts by oldest updated ascending without mutating input', () => {
    const sorted = sortSummariesByOldestUpdated(docs);
    expect(sorted.map((d) => d.id)).toEqual(['old', 'mid', 'new']);
    expect(docs[0]?.id).toBe('new');
  });

  it('limits visible ids to oldest N', () => {
    expect([...getGuestVisibleDocumentIds(docs, 2)]).toEqual(['old', 'mid']);
  });

  it('filters summaries to guest-visible set preserving input order', () => {
    expect(filterGuestVisibleSummaries(docs, 2).map((d) => d.id)).toEqual(['old', 'mid']);
  });

  it('checks visibility and counts hidden docs', () => {
    expect(isGuestVisibleDocumentId('old', docs, 2)).toBe(true);
    expect(isGuestVisibleDocumentId('new', docs, 2)).toBe(false);
    expect(countHiddenGuestDocuments(docs, 2)).toBe(1);
    expect(countHiddenGuestDocuments(docs, 10)).toBe(0);
  });
});
