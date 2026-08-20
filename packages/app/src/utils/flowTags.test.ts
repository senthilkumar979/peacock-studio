import { beforeEach, describe, expect, it, vi } from 'vitest';
import { collectLibraryTagSuggestions, collectTagsFromFlowDocuments } from './flowTags';

vi.mock('@/storage/libraryRouter', () => ({
  listFlowSummaries: vi.fn(),
  getFlowDocument: vi.fn(),
}));

import { getFlowDocument, listFlowSummaries } from '@/storage/libraryRouter';

describe('collectTagsFromFlowDocuments', () => {
  it('dedupes tags case-insensitively across documents', () => {
    const tags = collectTagsFromFlowDocuments([
      { flow: { flow: { tags: ['Onboarding', 'onboarding', 'HR'] } } },
      { flow: { flow: { tags: ['Finance'] } } },
    ]);
    expect(tags).toEqual(['finance', 'hr', 'onboarding']);
  });

  it('skips empty tags and missing tag arrays', () => {
    expect(
      collectTagsFromFlowDocuments([
        { flow: { flow: { tags: ['  ', 'Alpha'] } } },
        { flow: { flow: {} } },
      ]),
    ).toEqual(['alpha']);
  });
});

describe('collectLibraryTagSuggestions', () => {
  beforeEach(() => {
    vi.mocked(listFlowSummaries).mockReset();
    vi.mocked(getFlowDocument).mockReset();
  });

  it('loads documents from summaries and returns sorted unique tags', async () => {
    vi.mocked(listFlowSummaries).mockResolvedValue([
      { id: 'a' } as Awaited<ReturnType<typeof listFlowSummaries>>[number],
      { id: 'b' } as Awaited<ReturnType<typeof listFlowSummaries>>[number],
    ]);
    vi.mocked(getFlowDocument)
      .mockResolvedValueOnce({
        flow: { flow: { tags: ['Zebra', 'alpha'] } },
      } as Awaited<ReturnType<typeof getFlowDocument>>)
      .mockResolvedValueOnce({
        flow: { flow: { tags: ['Alpha', '  '] } },
      } as Awaited<ReturnType<typeof getFlowDocument>>);

    await expect(collectLibraryTagSuggestions()).resolves.toEqual(['alpha', 'zebra']);
    expect(getFlowDocument).toHaveBeenCalledWith('a');
    expect(getFlowDocument).toHaveBeenCalledWith('b');
  });

  it('ignores missing documents', async () => {
    vi.mocked(listFlowSummaries).mockResolvedValue([
      { id: 'missing' } as Awaited<ReturnType<typeof listFlowSummaries>>[number],
    ]);
    vi.mocked(getFlowDocument).mockResolvedValue(undefined);
    await expect(collectLibraryTagSuggestions()).resolves.toEqual([]);
  });
});
