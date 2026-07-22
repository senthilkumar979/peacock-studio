import { useCallback, useLayoutEffect, useRef, useState } from 'react';

export function useImageLoaded(src: string | undefined | null) {
  const [isLoaded, setIsLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const srcRef = useRef(src);

  srcRef.current = src;

  useLayoutEffect(() => {
    setIsLoaded(false);
    if (!src) return;

    const img = imgRef.current;
    if (img?.complete && img.naturalWidth > 0 && img.currentSrc === src) {
      setIsLoaded(true);
    }
  }, [src]);

  const onLoad = useCallback(() => {
    const img = imgRef.current;
    if (img && srcRef.current && img.currentSrc === srcRef.current) {
      setIsLoaded(true);
    }
  }, []);

  const onError = useCallback(() => {
    setIsLoaded(false);
  }, []);

  return { isLoaded, imgRef, onLoad, onError };
}
