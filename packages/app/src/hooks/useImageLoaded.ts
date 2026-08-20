import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { isImagePrefetched } from '@/utils/prefetchImages';

/** Relative `src` values resolve to absolute `img.currentSrc` — compare via URL.href. */
export function imageSrcMatches(img: HTMLImageElement, src: string): boolean {
  if (!src) return false;
  if (img.currentSrc === src || img.src === src) return true;
  try {
    const resolved = new URL(src, typeof window !== 'undefined' ? window.location.href : undefined)
      .href;
    return img.currentSrc === resolved || img.src === resolved;
  } catch {
    return false;
  }
}

export function useImageLoaded(src: string | undefined | null) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const srcRef = useRef(src);

  srcRef.current = src;

  useLayoutEffect(() => {
    setIsLoaded(false);
    setHasError(false);
    if (!src) return;

    if (isImagePrefetched(src)) {
      setIsLoaded(true);
      return;
    }

    const img = imgRef.current;
    if (img?.complete && img.naturalWidth > 0 && imageSrcMatches(img, src)) {
      setIsLoaded(true);
    }
  }, [src]);

  const onLoad = useCallback(() => {
    const img = imgRef.current;
    if (img && srcRef.current && imageSrcMatches(img, srcRef.current)) {
      setHasError(false);
      setIsLoaded(true);
    }
  }, []);

  const onError = useCallback(() => {
    setIsLoaded(false);
    setHasError(true);
  }, []);

  return { isLoaded, hasError, imgRef, onLoad, onError };
}
