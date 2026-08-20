import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useDocumentShareModal } from './useDocumentShareModal';

vi.mock('@/components/share/ShareDocumentModal', () => ({
  ShareDocumentModal: (props: Record<string, unknown>) => {
    void props;
    return null;
  },
}));

vi.mock('@/services/flowLibraryService', () => ({
  persistCurrentFlow: vi.fn().mockResolvedValue(undefined),
}));

const flowStore = {
  flow: { id: 'f' },
  steps: [],
  screenshotUrls: {},
  stepResources: {},
  shareSettings: { includeMainFlow: true },
  status: 'draft',
  updateShareSettings: vi.fn(),
};

vi.mock('@/store/flowStore', () => ({
  useFlowStore: vi.fn((selector: (s: typeof flowStore) => unknown) => selector(flowStore)),
}));

import { persistCurrentFlow } from '@/services/flowLibraryService';

describe('useDocumentShareModal', () => {
  beforeEach(() => {
    flowStore.updateShareSettings.mockClear();
    vi.mocked(persistCurrentFlow).mockClear();
  });

  it('opens share modal and wires save handler', () => {
    const { result } = renderHook(() => useDocumentShareModal('doc-1'));
    expect(result.current.shareModal).toBeTruthy();

    act(() => {
      result.current.openShare();
    });

    const modal = result.current.shareModal as {
      props: {
        isOpen: boolean;
        onShareSettingsSave: (settings: unknown) => void;
        onClose: () => void;
      };
    };

    expect(modal.props.isOpen).toBe(true);
    act(() => {
      modal.props.onShareSettingsSave({ includeMainFlow: false });
    });
    expect(flowStore.updateShareSettings).toHaveBeenCalledWith({ includeMainFlow: false });
    expect(persistCurrentFlow).toHaveBeenCalledWith('doc-1');

    act(() => {
      modal.props.onClose();
    });
    expect(
      (result.current.shareModal as { props: { isOpen: boolean } }).props.isOpen,
    ).toBe(false);
  });
});
