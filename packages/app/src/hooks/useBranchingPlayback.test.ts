import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useBranchingPlayback } from './useBranchingPlayback';

vi.mock('@peacock/shared', async () => {
  const actual = await vi.importActual<typeof import('@peacock/shared')>('@peacock/shared');
  return {
    ...actual,
    getPlayerOutlineSegments: vi.fn(() => [
      { type: 'step', step: { id: 's1' } },
      {
        type: 'branch',
        branch: {
          id: 'b1',
          paths: [
            {
              id: 'p1',
              targetDocumentId: 'linked',
              fromStepId: 'a',
              toStepId: 'b',
              label: 'A',
              order: 0,
            },
          ],
        },
      },
      { type: 'section', section: { id: 'sec' } },
    ]),
    sortBranchPaths: vi.fn((paths: unknown[]) => paths),
    getPlayableStepRange: vi.fn(() => [{ id: 'ls1' }, { id: 'ls2' }]),
    getStepScreenshotUrl: vi.fn(() => null),
  };
});

vi.mock('@/store/flowStore', () => ({
  useViewerOutline: vi.fn(() => []),
}));

vi.mock('@/services/flowLibraryService', () => ({
  getFlowDocument: vi.fn(),
}));

vi.mock('@/utils/prefetchImages', () => ({
  prefetchImages: vi.fn().mockResolvedValue(undefined),
}));

import { getFlowDocument } from '@/services/flowLibraryService';

describe('useBranchingPlayback', () => {
  beforeEach(() => {
    vi.mocked(getFlowDocument).mockReset();
  });

  it('exposes segment counts and navigates main outline', () => {
    const { result } = renderHook(() => useBranchingPlayback());
    expect(result.current.playableStepCount).toBe(1);
    expect(result.current.branchCount).toBe(1);
    expect(result.current.sectionCount).toBe(1);
    expect(result.current.selectedPathByBranchId.b1).toBe('p1');

    act(() => {
      result.current.goNext();
    });
    expect(result.current.currentIndex).toBe(1);

    act(() => {
      result.current.goPrevious();
      result.current.replay();
    });
    expect(result.current.currentIndex).toBe(0);
  });

  it('loads linked path playback', async () => {
    vi.mocked(getFlowDocument).mockResolvedValue({
      steps: [{ id: 'ls1' }, { id: 'ls2' }],
      screenshotUrls: {},
    } as never);

    const { result } = renderHook(() => useBranchingPlayback());
    await act(async () => {
      result.current.selectBranchPath({
        id: 'p1',
        targetDocumentId: 'linked',
        fromStepId: 'a',
        toStepId: 'b',
        label: 'A',
        order: 0,
      } as never);
    });

    await waitFor(() => expect(result.current.linkedPlayback).toBeTruthy());
    expect(result.current.linkedPlayback?.steps).toHaveLength(2);

    act(() => {
      result.current.goNext();
    });
    expect(result.current.linkedPlayback?.stepIndex).toBe(1);

    act(() => {
      result.current.goPrevious();
    });
    expect(result.current.linkedPlayback?.stepIndex).toBe(0);
  });

  it('sets linked error when document missing', async () => {
    vi.mocked(getFlowDocument).mockResolvedValue(undefined);
    const { result } = renderHook(() => useBranchingPlayback());
    await act(async () => {
      result.current.selectBranchPath({
        id: 'p1',
        targetDocumentId: 'gone',
        fromStepId: 'a',
        toStepId: 'b',
        label: 'A',
        order: 0,
      } as never);
    });
    await waitFor(() => expect(result.current.linkedError).toMatch(/no longer available/));
  });
});
