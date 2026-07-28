import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { isMarketingPath } from '@/utils/marketingRoutes';

/** Module-level latch so pathname churn cannot schedule overlapping inits. */
let sentryBootScheduled = false;

/**
 * Boots Sentry after first paint, but only once the user leaves marketing routes.
 * Keeps cold `/` loads free of Sentry network/console noise for Lighthouse BP.
 */
export const DeferredSentry = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    if (isMarketingPath(pathname) || sentryBootScheduled) return;
    sentryBootScheduled = true;
    void import('@/observability/sentry').then((m) => m.initSentry());
  }, [pathname]);

  return null;
};
