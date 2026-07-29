import { useCallback, useRef } from 'react';
import { Analytics, type BeforeSendEvent } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { useConsent } from '@/hooks/useConsent';
import { sanitizeAnalyticsUrl } from '@/analytics/sanitizeAnalyticsUrl';

function sanitizeEventUrl<T extends { url: string }>(event: T): T {
  return { ...event, url: sanitizeAnalyticsUrl(event.url) };
}

/**
 * Vercel Web Analytics (consent-gated) and Speed Insights (cookieless RUM).
 * Production-only — no SDK load during local dev.
 */
export const VercelObservability = () => {
  const { isAnalyticsAllowed } = useConsent();
  const isAnalyticsAllowedRef = useRef(isAnalyticsAllowed);
  isAnalyticsAllowedRef.current = isAnalyticsAllowed;

  const analyticsBeforeSend = useCallback((event: BeforeSendEvent) => {
    if (!isAnalyticsAllowedRef.current) return null;
    return sanitizeEventUrl(event);
  }, []);

  const speedInsightsBeforeSend = useCallback(
    (event: { type: 'vital'; url: string; route?: string }) => sanitizeEventUrl(event),
    [],
  );

  if (!import.meta.env.PROD) return null;

  return (
    <>
      {isAnalyticsAllowed && <Analytics beforeSend={analyticsBeforeSend} />}
      <SpeedInsights beforeSend={speedInsightsBeforeSend} />
    </>
  );
};
