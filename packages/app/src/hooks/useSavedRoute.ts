import { useEffect, useState } from 'react';
import { getRoute } from '@/services/routeLibraryService';
import { useRouteBuilderStore } from '@/store/routeBuilderStore';

export function useSavedRoute(routeId: string | undefined) {
  const route = useRouteBuilderStore((state) => state.route);
  const isLoaded = useRouteBuilderStore((state) => state.isLoaded);
  const storeRouteId = route?.id ?? null;
  const hydrateFromRoute = useRouteBuilderStore((state) => state.hydrateFromRoute);
  const resetRoute = useRouteBuilderStore((state) => state.resetRoute);

  const [isLoading, setIsLoading] = useState(Boolean(routeId));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!routeId) {
      setIsLoading(false);
      setError('Missing route id.');
      return;
    }

    if (isLoaded && storeRouteId === routeId) {
      setIsLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setError(null);

    if (storeRouteId && storeRouteId !== routeId) {
      resetRoute();
    }

    void (async () => {
      const next = await getRoute(routeId);
      if (cancelled) return;

      if (!next) {
        setError('This route was not found. It may have been deleted.');
        setIsLoading(false);
        return;
      }

      hydrateFromRoute(next);
      if (!cancelled) setIsLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [routeId, isLoaded, storeRouteId, hydrateFromRoute, resetRoute]);

  return {
    route,
    isLoading,
    isLoaded: isLoaded && storeRouteId === routeId,
    error,
  };
}
