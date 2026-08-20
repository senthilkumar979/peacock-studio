import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useActiveSection } from './useActiveSection';

describe('useActiveSection', () => {
  it('defaults to the first section id', () => {
    const { result } = renderHook(() => useActiveSection(['a', 'b', 'c'] as const));
    expect(result.current).toBe('a');
  });

  it('updates when scroll position crosses sections', () => {
    const a = document.createElement('div');
    a.id = 'a';
    Object.defineProperty(a, 'offsetTop', { value: 0 });
    const b = document.createElement('div');
    b.id = 'b';
    Object.defineProperty(b, 'offsetTop', { value: 500 });
    document.body.append(a, b);

    const { result } = renderHook(() => useActiveSection(['a', 'b'] as const, 100));

    act(() => {
      Object.defineProperty(window, 'scrollY', { value: 450, configurable: true });
      window.dispatchEvent(new Event('scroll'));
    });

    expect(result.current).toBe('b');

    a.remove();
    b.remove();
  });
});
