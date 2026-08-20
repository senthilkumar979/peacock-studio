import { beforeEach, describe, expect, it, vi } from 'vitest';
import { checkPages } from './checkPages';

vi.mock('@/storage/libraryRouter', () => ({
  listFlowSummaries: vi.fn(),
  listProductTourSummaries: vi.fn(),
}));

import { listFlowSummaries, listProductTourSummaries } from '@/storage/libraryRouter';

describe('checkPages', () => {
  beforeEach(() => {
    vi.mocked(listFlowSummaries).mockReset();
    vi.mocked(listProductTourSummaries).mockReset();
  });

  it('returns registered routes plus library data pass', async () => {
    vi.mocked(listFlowSummaries).mockResolvedValue([{ id: 'f1' }] as never);
    vi.mocked(listProductTourSummaries).mockResolvedValue([{ id: 't1' }, { id: 't2' }] as never);

    const results = await checkPages();
    expect(results.some((r) => r.id === 'page-dashboard' && r.status === 'pass')).toBe(true);
    expect(results.some((r) => r.id === 'page-tours')).toBe(true);
    expect(results.find((r) => r.id === 'page-library-data')).toMatchObject({
      status: 'pass',
      detail: expect.stringContaining('1 flow doc'),
    });
    expect(results.find((r) => r.id === 'page-library-data')?.detail).toContain('2 product tour');
  });

  it('fails library data check when list throws', async () => {
    vi.mocked(listFlowSummaries).mockRejectedValue(new Error('offline'));
    vi.mocked(listProductTourSummaries).mockResolvedValue([]);

    const results = await checkPages();
    expect(results.find((r) => r.id === 'page-library-data')).toMatchObject({
      status: 'fail',
      detail: expect.stringContaining('offline'),
    });
  });
});
