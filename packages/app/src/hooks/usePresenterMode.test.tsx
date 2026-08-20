import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { usePresenterMode } from './usePresenterMode';

function createWrapper(initialEntry: string) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <MemoryRouter initialEntries={[initialEntry]}>{children}</MemoryRouter>;
  };
}

describe('usePresenterMode', () => {
  it('is presenter when query param is set', () => {
    const { result } = renderHook(() => usePresenterMode(), {
      wrapper: createWrapper('/play?presenter=1'),
    });
    expect(result.current.isPresenter).toBe(true);
  });

  it('is presenter when forced', () => {
    const { result } = renderHook(() => usePresenterMode({ forcedPresenter: true }), {
      wrapper: createWrapper('/play'),
    });
    expect(result.current.isPresenter).toBe(true);
  });

  it('enterPresenter sets local + query and requests fullscreen', () => {
    const requestFullscreen = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() => usePresenterMode(), {
      wrapper: createWrapper('/play'),
    });

    const el = document.createElement('div');
    el.requestFullscreen = requestFullscreen;
    result.current.rootRef.current = el;

    act(() => {
      result.current.enterPresenter();
    });

    expect(result.current.isPresenter).toBe(true);
    expect(requestFullscreen).toHaveBeenCalled();
  });

  it('exitPresenter clears query and exits fullscreen', () => {
    const exitFullscreen = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(document, 'fullscreenElement', {
      configurable: true,
      get: () => document.documentElement,
    });
    document.exitFullscreen = exitFullscreen;

    const { result } = renderHook(() => usePresenterMode(), {
      wrapper: createWrapper('/play?presenter=1'),
    });
    expect(result.current.isPresenter).toBe(true);

    act(() => {
      result.current.exitPresenter();
    });

    expect(result.current.isPresenter).toBe(false);
    expect(exitFullscreen).toHaveBeenCalled();

    Object.defineProperty(document, 'fullscreenElement', {
      configurable: true,
      get: () => null,
    });
  });

  it('exits local presenter when fullscreen ends without forced mode', () => {
    const { result } = renderHook(() => usePresenterMode(), {
      wrapper: createWrapper('/play'),
    });

    act(() => {
      result.current.enterPresenter();
    });
    expect(result.current.isPresenter).toBe(true);

    Object.defineProperty(document, 'fullscreenElement', {
      configurable: true,
      get: () => null,
    });

    act(() => {
      document.dispatchEvent(new Event('fullscreenchange'));
    });

    expect(result.current.isPresenter).toBe(false);
  });
});
