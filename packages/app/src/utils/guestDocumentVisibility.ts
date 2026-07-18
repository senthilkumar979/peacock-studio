import type { SavedFlowSummary } from '@/types/savedFlow';

/** Guest visibility: oldest documents by `updatedAt` (ascending). */
export function sortSummariesByOldestUpdated(
  summaries: SavedFlowSummary[],
): SavedFlowSummary[] {
  return [...summaries].sort((a, b) => a.updatedAt - b.updatedAt);
}

export function getGuestVisibleDocumentIds(
  summaries: SavedFlowSummary[],
  limit: number,
): Set<string> {
  const oldest = sortSummariesByOldestUpdated(summaries).slice(0, limit);
  return new Set(oldest.map((summary) => summary.id));
}

export function filterGuestVisibleSummaries(
  summaries: SavedFlowSummary[],
  limit: number,
): SavedFlowSummary[] {
  const visibleIds = getGuestVisibleDocumentIds(summaries, limit);
  return summaries.filter((summary) => visibleIds.has(summary.id));
}

export function isGuestVisibleDocumentId(
  documentId: string,
  summaries: SavedFlowSummary[],
  limit: number,
): boolean {
  return getGuestVisibleDocumentIds(summaries, limit).has(documentId);
}

export function countHiddenGuestDocuments(
  summaries: SavedFlowSummary[],
  limit: number,
): number {
  return Math.max(0, summaries.length - limit);
}
