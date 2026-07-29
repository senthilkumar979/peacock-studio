import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { getFreshchatConfig } from '@/analytics/config';
import { LANDING_PATH } from '@/constants/routes';
import { isMobileClient } from '@/utils/isMobileClient';

const FRESHCHAT_SCRIPT_ID = 'freshchat-widget';
const FRESHCHAT_IDLE_TIMEOUT_MS = 4000;

function applyRouteVisibility(): void {
  setFreshchatVisibility(shouldLoadFreshchat(window.location.pathname));
}

function whenWidgetReady(onReady: () => void): void {
  if (window.fcWidget?.isLoaded?.()) {
    onReady();
    return;
  }
  window.fcWidget?.on?.('widget:loaded', onReady);

  // fw-cdn scripts sometimes expose fcWidget slightly after onload.
  let attempts = 0;
  const timer = window.setInterval(() => {
    attempts += 1;
    if (window.fcWidget?.isLoaded?.()) {
      window.clearInterval(timer);
      onReady();
      return;
    }
    if (attempts >= 40) window.clearInterval(timer);
  }, 250);
}

function injectFreshchatScript(scriptSrc: string): void {
  if (document.getElementById(FRESHCHAT_SCRIPT_ID)) {
    whenWidgetReady(applyRouteVisibility);
    return;
  }

  const script = document.createElement('script');
  script.id = FRESHCHAT_SCRIPT_ID;
  script.async = true;
  script.src = scriptSrc;
  script.setAttribute('chat', 'true');
  script.onload = () => whenWidgetReady(applyRouteVisibility);
  document.body.appendChild(script);
}

/** Support chat is marketing homepage + desktop only — never inside the product app or on mobile. */
function isSupportWidgetRoute(pathname: string): boolean {
  return pathname === LANDING_PATH;
}

function shouldLoadFreshchat(pathname: string): boolean {
  return isSupportWidgetRoute(pathname) && !isMobileClient();
}

function setFreshchatVisibility(visible: boolean): void {
  if (!window.fcWidget?.isLoaded?.()) return;
  if (visible) window.fcWidget.show();
  else window.fcWidget.hide();
}

function scheduleIdle(task: () => void): () => void {
  if (typeof window.requestIdleCallback === 'function') {
    const id = window.requestIdleCallback(() => task(), { timeout: FRESHCHAT_IDLE_TIMEOUT_MS });
    return () => window.cancelIdleCallback(id);
  }
  const timer = window.setTimeout(task, 2000);
  return () => window.clearTimeout(timer);
}

/**
 * Loads the Freshchat live-chat widget on the desktop landing page only. Renders nothing.
 * Uses the Freshworks EU CDN embed (`eu.fw-cdn.com/...js`), not wchat.freshchat.com.
 * Injection is deferred until idle so it never contends with FCP/LCP.
 */
export const SupportWidget = () => {
  // Primitive dep — getFreshchatConfig() returns a new object each call and would
  // cancel/reschedule the idle inject forever during landing-page re-renders.
  const scriptSrc = getFreshchatConfig()?.scriptSrc;
  const { pathname } = useLocation();
  const loadedRef = useRef(false);
  const visible = shouldLoadFreshchat(pathname);

  useEffect(() => {
    if (!scriptSrc || !visible) return;

    if (!loadedRef.current) {
      return scheduleIdle(() => {
        if (loadedRef.current) return;
        if (!shouldLoadFreshchat(window.location.pathname)) return;
        injectFreshchatScript(scriptSrc);
        loadedRef.current = true;
      });
    }

    setFreshchatVisibility(true);
  }, [scriptSrc, visible]);

  useEffect(() => {
    if (!scriptSrc || !loadedRef.current || visible) return;
    setFreshchatVisibility(false);
  }, [scriptSrc, visible]);

  return null;
};
