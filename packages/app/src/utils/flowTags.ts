import { listFlowSummaries, getFlowDocument } from '@/storage/libraryRouter';
import { normalizeFlowTag } from '@peacock/shared';

function collectNormalizedTags(values: Array<string | undefined>): string[] {
  const seen = new Set<string>();
  const tags: string[] = [];
  for (const value of values) {
    const next = normalizeFlowTag(value ?? '');
    if (!next || seen.has(next)) continue;
    seen.add(next);
    tags.push(next);
  }
  return tags.sort((a, b) => a.localeCompare(b));
}

export async function collectLibraryTagSuggestions(): Promise<string[]> {
  const summaries = await listFlowSummaries();
  const docs = await Promise.all(summaries.map((summary) => getFlowDocument(summary.id)));
  return collectNormalizedTags(docs.flatMap((doc) => doc?.flow.flow.tags ?? []));
}

export function collectTagsFromFlowDocuments(
  documents: Array<{ flow: { flow: { tags?: string[] } } }>,
): string[] {
  return collectNormalizedTags(documents.flatMap((doc) => doc.flow.flow.tags ?? []));
}
