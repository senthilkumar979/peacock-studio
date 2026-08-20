import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useImageLoaded } from './useImageLoaded';

vi.mock('@/utils/prefetchImages', () => ({
  isImagePrefetched: vi.fn(() => false),
}));

import { isImagePrefetched } from '@/utils/prefetchImages';

describe('useImageLoaded', () => {
  beforeEach(() => {
    vi.mocked(isImagePrefetched).mockReturnValue(false);
  });

  it('starts unloaded when src is empty', () => {
    const { result } = renderHook(() => useImageLoaded(null));
    expect(result.current.isLoaded).toBe(false);
  });

  it('marks loaded when image was prefetched', () => {
    vi.mocked(isImagePrefetched).mockReturnValue(true);
    const { result } = renderHook(() => useImageLoaded('https://example.com/a.png'));
    expect(result.current.isLoaded).toBe(true);
  });

  it('resets when src changes', () => {
    vi.mocked(isImagePrefetched).mockReturnValue(true);
    const { result, rerender } = renderHook(
      ({ src }: { src: string | null }) => useImageLoaded(src),
      { initialProps: { src: 'https://example.com/a.png' as string | null } },
    );
    expect(result.current.isLoaded).toBe(true);

    vi.mocked(isImagePrefetched).mockReturnValue(false);
    rerender({ src: 'https://example.com/b.png' });
    expect(result.current.isLoaded).toBe(false);
  });

  it('sets loaded on onLoad when currentSrc matches', () => {
    const { result } = renderHook(() => useImageLoaded('https://example.com/a.png'));
    const img = document.createElement('img');
    Object.defineProperty(img, 'currentSrc', { value: 'https://example.com/a.png' });
    result.current.imgRef.current = img;

    act(() => {
      result.current.onLoad();
    });
    expect(result.current.isLoaded).toBe(true);
  });

  it('ignores onLoad when currentSrc does not match', () => {
    const { result } = renderHook(() => useImageLoaded('https://example.com/a.png'));
    const img = document.createElement('img');
    Object.defineProperty(img, 'currentSrc', { value: 'https://example.com/other.png' });
    result.current.imgRef.current = img;

    act(() => {
      result.current.onLoad();
    });
    expect(result.current.isLoaded).toBe(false);
  });

  it('clears loaded on onError', () => {
    vi.mocked(isImagePrefetched).mockReturnValue(true);
    const { result } = renderHook(() => useImageLoaded('https://example.com/a.png'));
    expect(result.current.isLoaded).toBe(true);

    act(() => {
      result.current.onError();
    });
    expect(result.current.isLoaded).toBe(false);
    expect(result.current.hasError).toBe(true);
  });

  it('resets hasError when src changes', () => {
    const { result, rerender } = renderHook(
      ({ src }: { src: string }) => useImageLoaded(src),
      { initialProps: { src: 'https://example.com/a.png' } },
    );

    act(() => {
      result.current.onError();
    });
    expect(result.current.hasError).toBe(true);

    rerender({ src: 'https://example.com/b.png' });
    expect(result.current.hasError).toBe(false);
  });

  it('marks loaded from complete img with matching currentSrc', () => {
    const { result, rerender } = renderHook(
      ({ src }: { src: string }) => useImageLoaded(src),
      { initialProps: { src: '' } },
    );

    const img = document.createElement('img');
    Object.defineProperty(img, 'complete', { value: true });
    Object.defineProperty(img, 'naturalWidth', { value: 100 });
    Object.defineProperty(img, 'currentSrc', {
      get: () => 'https://example.com/ready.png',
    });
    result.current.imgRef.current = img;

    rerender({ src: 'https://example.com/ready.png' });
    expect(result.current.isLoaded).toBe(true);
  });
});
