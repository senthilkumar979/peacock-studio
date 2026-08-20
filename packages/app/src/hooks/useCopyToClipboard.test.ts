import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useCopyToClipboard } from './useCopyToClipboard';

describe('useCopyToClipboard', () => {
  const writeText = vi.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    vi.useFakeTimers();
    writeText.mockReset();
    writeText.mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns false for blank text without writing', async () => {
    const { result } = renderHook(() => useCopyToClipboard(1000));
    let ok = true;
    await act(async () => {
      ok = await result.current.copy('   ');
    });
    expect(ok).toBe(false);
    expect(writeText).not.toHaveBeenCalled();
    expect(result.current.isCopied).toBe(false);
  });

  it('copies text, sets isCopied, then resets after timeout', async () => {
    const { result } = renderHook(() => useCopyToClipboard(500));
    let ok = false;
    await act(async () => {
      ok = await result.current.copy('hello');
    });
    expect(ok).toBe(true);
    expect(writeText).toHaveBeenCalledWith('hello');
    expect(result.current.isCopied).toBe(true);

    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(result.current.isCopied).toBe(false);
  });

  it('returns false and clears isCopied when clipboard write fails', async () => {
    writeText.mockRejectedValueOnce(new Error('denied'));
    const { result } = renderHook(() => useCopyToClipboard());
    let ok = true;
    await act(async () => {
      ok = await result.current.copy('secret');
    });
    expect(ok).toBe(false);
    expect(result.current.isCopied).toBe(false);
  });

  it('clears prior timeout when copying again', async () => {
    const { result } = renderHook(() => useCopyToClipboard(1000));
    await act(async () => {
      await result.current.copy('one');
    });
    expect(result.current.isCopied).toBe(true);

    act(() => {
      vi.advanceTimersByTime(400);
    });

    await act(async () => {
      await result.current.copy('two');
    });
    expect(result.current.isCopied).toBe(true);

    act(() => {
      vi.advanceTimersByTime(600);
    });
    expect(result.current.isCopied).toBe(true);

    act(() => {
      vi.advanceTimersByTime(400);
    });
    expect(result.current.isCopied).toBe(false);
  });
});
