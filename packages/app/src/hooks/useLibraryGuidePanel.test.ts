import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useLibraryGuidePanel } from './useLibraryGuidePanel';

describe('useLibraryGuidePanel', () => {
  it('always shows guide when library has no items', () => {
    const { result } = renderHook(() => useLibraryGuidePanel(false));
    expect(result.current.showGuide).toBe(true);
    expect(result.current.showGuideToggle).toBe(false);
    expect(result.current.isGuideOpen).toBe(false);
  });

  it('hides guide by default when items exist and toggles open', () => {
    const { result } = renderHook(() => useLibraryGuidePanel(true));
    expect(result.current.showGuide).toBe(false);
    expect(result.current.showGuideToggle).toBe(true);

    act(() => {
      result.current.toggleGuide();
    });
    expect(result.current.isGuideOpen).toBe(true);
    expect(result.current.showGuide).toBe(true);

    act(() => {
      result.current.toggleGuide();
    });
    expect(result.current.showGuide).toBe(false);
  });
});
