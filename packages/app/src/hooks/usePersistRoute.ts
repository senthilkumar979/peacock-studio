import { useEffect, useRef } from 'react';
import { persistRoute } from '@/services/routeLibraryService';
import { useRouteBuilderStore } from '@/store/routeBuilderStore';
import { notifyPersistError } from '@/utils/notify';

const PERSIST_DEBOUNCE_MS = 1500;

export function usePersistRoute(enabled: boolean): void {
  const route = useRouteBuilderStore((state) => state.route);
  const isLoaded = useRouteBuilderStore((state) => state.isLoaded);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled || !route || !isLoaded) return;

    if (timerRef.current) window.clearTimeout(timerRef.current);

    timerRef.current = window.setTimeout(() => {
      void persistRoute(route).catch((error) => {
        notifyPersistError(error, 'Save route');
      });
    }, PERSIST_DEBOUNCE_MS);

    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [enabled, route, isLoaded]);
}
