import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { isMarketingPath } from '@/utils/marketingRoutes';

/**
 * Boots Sentry after first paint, but only once the user leaves marketing routes.
 * Keeps cold `/` loads free of Sentry network/console noise for Lighthouse BP.
 */
export const DeferredSentry = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    if (isMarketingPath(pathname)) return;
    void import('@/observability/sentry').then((m) => m.initSentry());
  }, [pathname]);

  return null;
};
