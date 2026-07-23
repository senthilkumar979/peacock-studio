import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { getTawkConfig } from '@/analytics/config';
import { LANDING_PATH } from '@/constants/routes';

const TAWK_SCRIPT_ID = 'tawk-to-embed';
const TAWK_IDLE_TIMEOUT_MS = 4000;

function injectTawkScript(propertyId: string, widgetId: string): void {
  if (document.getElementById(TAWK_SCRIPT_ID)) return;

  window.Tawk_API = window.Tawk_API || {};
  window.Tawk_LoadStart = new Date();

  const script = document.createElement('script');
  script.id = TAWK_SCRIPT_ID;
  script.async = true;
  script.defer = true;
  script.src = `https://embed.tawk.to/${propertyId}/${widgetId}`;
  script.charset = 'UTF-8';
  script.setAttribute('crossorigin', '*');
  document.body.appendChild(script);
}

/** Support chat is marketing-only — never inside the product app. */
function isSupportWidgetRoute(pathname: string): boolean {
  return pathname === LANDING_PATH;
}

function setTawkVisibility(visible: boolean): void {
  if (visible) window.Tawk_API?.showWidget?.();
  else window.Tawk_API?.hideWidget?.();
}

function scheduleIdle(task: () => void): () => void {
  if (typeof window.requestIdleCallback === 'function') {
    const id = window.requestIdleCallback(() => task(), { timeout: TAWK_IDLE_TIMEOUT_MS });
    return () => window.cancelIdleCallback(id);
  }
  const timer = window.setTimeout(task, 2000);
  return () => window.clearTimeout(timer);
}

/**
 * Loads the Tawk.to live-chat widget on the landing page only. Renders nothing.
 * Injection is deferred until the browser is idle so it never contends with FCP/LCP.
 */
export const SupportWidget = () => {
  const config = getTawkConfig();
  const { pathname } = useLocation();
  const loadedRef = useRef(false);
  const visible = isSupportWidgetRoute(pathname);

  useEffect(() => {
    if (!config || !visible) return;

    if (!loadedRef.current) {
      window.Tawk_API = window.Tawk_API || {};
      window.Tawk_API.onLoad = () => {
        setTawkVisibility(isSupportWidgetRoute(window.location.pathname));
      };

      return scheduleIdle(() => {
        if (loadedRef.current) return;
        if (!isSupportWidgetRoute(window.location.pathname)) return;
        injectTawkScript(config.propertyId, config.widgetId);
        loadedRef.current = true;
      });
    }

    setTawkVisibility(true);
  }, [config, visible]);

  useEffect(() => {
    if (!config || !loadedRef.current || visible) return;
    setTawkVisibility(false);
  }, [config, visible]);

  return null;
};
