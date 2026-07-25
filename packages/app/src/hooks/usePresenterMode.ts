import { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

interface UsePresenterModeOptions {
  /** External force (e.g. share link settings). */
  forcedPresenter?: boolean;
}

export function usePresenterMode({ forcedPresenter = false }: UsePresenterModeOptions = {}) {
  const [searchParams, setSearchParams] = useSearchParams();
  const rootRef = useRef<HTMLDivElement>(null);
  const queryPresenter = searchParams.get('presenter') === '1';
  const [localPresenter, setLocalPresenter] = useState(false);

  const isPresenter = forcedPresenter || queryPresenter || localPresenter;

  const exitPresenter = useCallback(() => {
    setLocalPresenter(false);
    if (searchParams.get('presenter') === '1') {
      const next = new URLSearchParams(searchParams);
      next.delete('presenter');
      setSearchParams(next, { replace: true });
    }
    if (document.fullscreenElement) {
      void document.exitFullscreen().catch(() => undefined);
    }
  }, [searchParams, setSearchParams]);

  const enterPresenter = useCallback(() => {
    setLocalPresenter(true);
    const next = new URLSearchParams(searchParams);
    next.set('presenter', '1');
    setSearchParams(next, { replace: true });
    const el = rootRef.current;
    if (el && !document.fullscreenElement) {
      void el.requestFullscreen?.().catch(() => undefined);
    }
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    if (!isPresenter) return;

    const onFullscreenChange = () => {
      if (!document.fullscreenElement && !forcedPresenter) {
        setLocalPresenter(false);
        if (searchParams.get('presenter') === '1') {
          const next = new URLSearchParams(searchParams);
          next.delete('presenter');
          setSearchParams(next, { replace: true });
        }
      }
    };

    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, [isPresenter, forcedPresenter, searchParams, setSearchParams]);

  useEffect(() => {
    if (!isPresenter || forcedPresenter) return;
    const el = rootRef.current;
    if (el && !document.fullscreenElement) {
      void el.requestFullscreen?.().catch(() => undefined);
    }
  }, [isPresenter, forcedPresenter]);

  return {
    rootRef,
    isPresenter,
    enterPresenter,
    exitPresenter,
  };
}
