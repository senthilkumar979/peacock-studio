import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useDocumentBranchPaths } from './useDocumentBranchPaths';

vi.mock('@peacock/shared', async () => {
  const actual = await vi.importActual<typeof import('@peacock/shared')>('@peacock/shared');
  return {
    ...actual,
    sortBranchPaths: vi.fn((paths: unknown[]) => paths),
    getPlayableStepRange: vi.fn(() => [{ id: 's1' }]),
  };
});

vi.mock('@/services/flowLibraryService', () => ({
  getFlowDocument: vi.fn(),
}));

import { getFlowDocument } from '@/services/flowLibraryService';

const branches = [
  {
    id: 'b1',
    paths: [
      {
        id: 'path-1',
        targetDocumentId: 'doc-2',
        fromStepId: 'a',
        toStepId: 'b',
        label: 'Path',
        order: 0,
      },
    ],
  },
] as never;

describe('useDocumentBranchPaths', () => {
  beforeEach(() => {
    vi.mocked(getFlowDocument).mockReset();
  });

  it('auto-selects and loads the first path per branch', async () => {
    vi.mocked(getFlowDocument).mockResolvedValue({
      steps: [{ id: 's1' }],
      screenshotUrls: { s1: 'u' },
    } as never);

    const { result } = renderHook(() => useDocumentBranchPaths(branches));
    await waitFor(() => {
      expect(result.current.selectedPathByBranchId.b1).toBe('path-1');
    });
    await waitFor(() => {
      expect(result.current.linkedContentByPathId['path-1']?.targetDocumentId).toBe('doc-2');
    });
  });

  it('records errors when linked demo unavailable', async () => {
    vi.mocked(getFlowDocument).mockResolvedValue(undefined);
    const { result } = renderHook(() => useDocumentBranchPaths(branches));
    await waitFor(() => {
      expect(result.current.errorsByPathId['path-1']).toMatch(/unavailable/);
    });
  });

  it('selectPath loads a new path on demand', async () => {
    vi.mocked(getFlowDocument).mockResolvedValue({
      steps: [{ id: 's1' }],
      screenshotUrls: {},
    } as never);
    const { result } = renderHook(() => useDocumentBranchPaths([]));
    await act(async () => {
      result.current.selectPath('b2', {
        id: 'path-x',
        targetDocumentId: 'doc-x',
        fromStepId: 'a',
        toStepId: 'b',
        label: 'X',
        order: 0,
      } as never);
    });
    await waitFor(() => {
      expect(result.current.linkedContentByPathId['path-x']).toBeTruthy();
    });
  });
});
