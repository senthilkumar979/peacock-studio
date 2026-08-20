import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useDocumentGuideProgress } from './useDocumentGuideProgress';

vi.mock('@/player/documentOutline', () => ({
  getDocumentGuideViewedStepCount: vi.fn(() => 2),
}));

import { getDocumentGuideViewedStepCount } from '@/player/documentOutline';

describe('useDocumentGuideProgress', () => {
  beforeEach(() => {
    vi.mocked(getDocumentGuideViewedStepCount).mockReturnValue(2);
  });

  it('computes percent from viewed steps', () => {
    const { result } = renderHook(() =>
      useDocumentGuideProgress([{ type: 'step', stepNumber: 1 } as never], 'step-1', 4),
    );
    expect(result.current).toEqual({ progressPercent: 50, viewedStepCount: 2 });
  });

  it('returns 0 percent when totalStepCount is 0', () => {
    vi.mocked(getDocumentGuideViewedStepCount).mockReturnValue(0);
    const { result } = renderHook(() => useDocumentGuideProgress([], null, 0));
    expect(result.current.progressPercent).toBe(0);
  });

  it('caps progress at 100', () => {
    vi.mocked(getDocumentGuideViewedStepCount).mockReturnValue(10);
    const { result } = renderHook(() => useDocumentGuideProgress([], 'x', 5));
    expect(result.current.progressPercent).toBe(100);
  });
});
