import { describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import type { FlowBranch } from '@peacock/shared';

vi.mock('@/services/flowLibraryService', () => ({
  getFlowDocument: vi.fn(async () => null),
}));

import { useBranchPathMetadata } from './useBranchPathMetadata';

const branch: FlowBranch = {
  id: 'b1',
  kind: 'branch',
  title: 'Choose',
  description: '',
  paths: [
    {
      id: 'p1',
      label: 'A',
      targetDocumentId: 'missing',
      targetTitle: 'A',
      targetDescription: '',
      fromStepId: 's1',
      toStepId: 's2',
      order: 0,
    },
  ],
};

describe('useBranchPathMetadata', () => {
  it('marks unavailable demos', async () => {
    const { result } = renderHook(() => useBranchPathMetadata(branch));
    await waitFor(() => {
      expect(result.current.p1?.rangeLabel).toBe('Demo unavailable');
    });
  });
});
