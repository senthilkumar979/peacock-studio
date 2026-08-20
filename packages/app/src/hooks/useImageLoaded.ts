import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { isImagePrefetched } from '@/utils/prefetchImages';

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
    if (img?.complete && img.naturalWidth > 0 && img.currentSrc === src) {
      setIsLoaded(true);
    }
  }, [src]);

  const onLoad = useCallback(() => {
    const img = imgRef.current;
    if (img && srcRef.current && img.currentSrc === srcRef.current) {
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
