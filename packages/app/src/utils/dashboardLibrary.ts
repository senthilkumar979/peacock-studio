import type { SavedFlowSummary } from '@/types/savedFlow';
import { stripHtmlTags } from '@/utils/richText';

export type DashboardSortMode = 'newest' | 'oldest' | 'mostSteps' | 'title';

export function filterSummaries(
  summaries: SavedFlowSummary[],
  query: string
): SavedFlowSummary[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return summaries;

  return summaries.filter((item) => {
    const haystack =
      `${item.title} ${stripHtmlTags(item.description)} ${item.version}`.toLowerCase();
    return haystack.includes(normalized);
  });
}

export function sortSummaries(
  summaries: SavedFlowSummary[],
  mode: DashboardSortMode
): SavedFlowSummary[] {
  const next = [...summaries];

  switch (mode) {
    case 'oldest':
      return next.sort((a, b) => a.generatedAt - b.generatedAt);
    case 'mostSteps':
      return next.sort((a, b) => b.stepCount - a.stepCount || b.generatedAt - a.generatedAt);
    case 'title':
      return next.sort((a, b) => a.title.localeCompare(b.title));
    case 'newest':
    default:
      return next.sort((a, b) => b.generatedAt - a.generatedAt);
  }
}

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}
