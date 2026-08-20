import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { useFlowDocDefaultView } from './useFlowDocDefaultView';

const STORAGE_KEY = 'peacock-flow-doc-default-view';

describe('useFlowDocDefaultView', () => {
  beforeEach(() => {
    localStorage.removeItem(STORAGE_KEY);
  });

  it('defaults to hub', () => {
    const { result } = renderHook(() => useFlowDocDefaultView());
    expect(result.current).toBe('hub');
  });

  it('reads stored preference on mount', () => {
    localStorage.setItem(STORAGE_KEY, 'player');
    const { result } = renderHook(() => useFlowDocDefaultView());
    expect(result.current).toBe('player');
  });

  it('updates when storage event fires for the preference key', () => {
    const { result } = renderHook(() => useFlowDocDefaultView());
    expect(result.current).toBe('hub');

    act(() => {
      localStorage.setItem(STORAGE_KEY, 'doc');
      window.dispatchEvent(
        new StorageEvent('storage', { key: STORAGE_KEY, newValue: 'doc' }),
      );
    });
    expect(result.current).toBe('doc');
  });

  it('ignores unrelated storage keys', () => {
    const { result } = renderHook(() => useFlowDocDefaultView());
    act(() => {
      window.dispatchEvent(new StorageEvent('storage', { key: 'other', newValue: 'x' }));
    });
    expect(result.current).toBe('hub');
  });
});
