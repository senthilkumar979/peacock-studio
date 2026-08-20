import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useHydrateResourceLabels } from './useHydrateResourceLabels';

const resources = [
  { id: 'r1', url: 'https://example.com/docs', label: undefined },
  { id: 'r2', url: 'https://example.com/help', label: 'Help Center' },
];

const flowStore = {
  isLoaded: true,
  documentId: 'doc-1' as string | null,
  stepResources: resources,
  getState() {
    return flowStore;
  },
};

vi.mock('@/store/flowStore', () => ({
  useFlowStore: Object.assign(
    vi.fn((selector: (s: typeof flowStore) => unknown) => selector(flowStore)),
    { getState: () => flowStore },
  ),
}));

vi.mock('@/utils/hydrateResourceLabel', () => ({
  hydrateResourceLabel: vi.fn(async () => true),
}));

vi.mock('@/services/flowLibraryService', () => ({
  persistCurrentFlow: vi.fn().mockResolvedValue(undefined),
}));

import { persistCurrentFlow } from '@/services/flowLibraryService';
import { hydrateResourceLabel } from '@/utils/hydrateResourceLabel';

describe('useHydrateResourceLabels', () => {
  beforeEach(() => {
    flowStore.isLoaded = true;
    flowStore.documentId = 'doc-1';
    flowStore.stepResources = [
      { id: 'r1', url: 'https://example.com/docs', label: undefined },
      { id: 'r2', url: 'https://example.com/help', label: 'Help Center' },
    ];
    vi.mocked(hydrateResourceLabel).mockClear();
    vi.mocked(hydrateResourceLabel).mockResolvedValue(true);
    vi.mocked(persistCurrentFlow).mockClear();
  });

  it('fetches titles for unlabeled resources and persists them', async () => {
    renderHook(() => useHydrateResourceLabels(true, true));

    await waitFor(() => {
      expect(hydrateResourceLabel).toHaveBeenCalledWith('r1', 'https://example.com/docs');
    });
    expect(hydrateResourceLabel).not.toHaveBeenCalledWith('r2', 'https://example.com/help');
    await waitFor(() => {
      expect(persistCurrentFlow).toHaveBeenCalledWith('doc-1');
    });
  });

  it('does not persist when persist is false', async () => {
    renderHook(() => useHydrateResourceLabels(true, false));

    await waitFor(() => {
      expect(hydrateResourceLabel).toHaveBeenCalled();
    });
    expect(persistCurrentFlow).not.toHaveBeenCalled();
  });

  it('does nothing when disabled or already labeled', () => {
    flowStore.stepResources = [{ id: 'r2', url: 'https://example.com/help', label: 'Help Center' }];
    renderHook(() => useHydrateResourceLabels(false, true));
    expect(hydrateResourceLabel).not.toHaveBeenCalled();
  });
});
