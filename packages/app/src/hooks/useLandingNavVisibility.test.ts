import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { useLandingNavVisibility } from './useLandingNavVisibility';

describe('useLandingNavVisibility', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 1000 });
    Object.defineProperty(window, 'scrollY', { configurable: true, value: 0, writable: true });
  });

  afterEach(() => {
    Object.defineProperty(window, 'scrollY', { configurable: true, value: 0, writable: true });
  });

  it('shows main nav near top of page', () => {
    const { result } = renderHook(() => useLandingNavVisibility());
    expect(result.current.showMainNav).toBe(true);
    expect(result.current.showSubNav).toBe(false);
  });

  it('switches to sub nav after scrolling past hero exit threshold', () => {
    const { result } = renderHook(() => useLandingNavVisibility());

    act(() => {
      Object.defineProperty(window, 'scrollY', { configurable: true, value: 1000 });
      window.dispatchEvent(new Event('scroll'));
    });

    expect(result.current.showMainNav).toBe(false);
    expect(result.current.showSubNav).toBe(true);
  });

  it('restores main nav when scrolling back into enter threshold', () => {
    const { result } = renderHook(() => useLandingNavVisibility());

    act(() => {
      Object.defineProperty(window, 'scrollY', { configurable: true, value: 1200 });
      window.dispatchEvent(new Event('scroll'));
    });
    expect(result.current.showSubNav).toBe(true);

    act(() => {
      Object.defineProperty(window, 'scrollY', { configurable: true, value: 800 });
      window.dispatchEvent(new Event('scroll'));
    });
    expect(result.current.showMainNav).toBe(true);
    expect(result.current.showSubNav).toBe(false);
  });

  it('keeps pastHero sticky while still above enter threshold', () => {
    const { result } = renderHook(() => useLandingNavVisibility());

    act(() => {
      Object.defineProperty(window, 'scrollY', { configurable: true, value: 1100 });
      window.dispatchEvent(new Event('scroll'));
    });
    expect(result.current.showSubNav).toBe(true);

    act(() => {
      Object.defineProperty(window, 'scrollY', { configurable: true, value: 950 });
      window.dispatchEvent(new Event('scroll'));
    });
    expect(result.current.showSubNav).toBe(true);
  });

  it('recomputes on resize', () => {
    const { result } = renderHook(() => useLandingNavVisibility());
    act(() => {
      Object.defineProperty(window, 'scrollY', { configurable: true, value: 1100 });
      window.dispatchEvent(new Event('resize'));
    });
    expect(result.current.showSubNav).toBe(true);
  });
});
