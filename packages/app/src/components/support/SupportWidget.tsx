import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { getFreshchatConfig } from '@/analytics/config';
import { isEmbedSharePath, LANDING_PATH } from '@/constants/routes';
import { isMobileClient } from '@/utils/isMobileClient';

const FRESHCHAT_SCRIPT_ID = 'freshchat-widget';
const FRESHCHAT_IDLE_TIMEOUT_MS = 4000;
const HIDE_SUPPORT_WIDGET_CLASS = 'peacock-hide-support-widget';

function applyRouteVisibility(): void {
  setFreshchatVisibility(shouldShowFreshchat(window.location.pathname));
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

/** Immersive authoring surfaces where the launcher covers primary actions (e.g. Save). */
export function isEditorRoute(pathname: string): boolean {
  if (pathname === '/editor' || pathname === '/tours/new') return true;
  if (pathname.endsWith('/edit')) return true;
  if (pathname.startsWith('/editor/')) return true;
  return false;
}

/** Routes where the support launcher must never appear (editors, embeds). */
export function shouldHideSupportWidget(pathname: string): boolean {
  return isEditorRoute(pathname) || isEmbedSharePath(pathname);
}

/** Support chat is marketing homepage + desktop only — never inside editors, embeds, or on mobile. */
function isSupportWidgetRoute(pathname: string): boolean {
  if (shouldHideSupportWidget(pathname)) return false;
  return pathname === LANDING_PATH;
}

function shouldShowFreshchat(pathname: string): boolean {
  return isSupportWidgetRoute(pathname) && !isMobileClient();
}

function setFreshchatVisibility(visible: boolean): void {
  document.documentElement.classList.toggle(HIDE_SUPPORT_WIDGET_CLASS, !visible);

  if (!window.fcWidget?.isLoaded?.()) return;
  if (visible) {
    window.fcWidget.show();
    return;
  }
  if (window.fcWidget.isOpen?.()) {
    window.fcWidget.close();
  }
  window.fcWidget.hide();
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
 * Hidden on all editor pages (and every non-landing route) so it never covers Save / toolbars.
 */
export const SupportWidget = () => {
  // Primitive dep — getFreshchatConfig() returns a new object each call and would
  // cancel/reschedule the idle inject forever during landing-page re-renders.
  const scriptSrc = getFreshchatConfig()?.scriptSrc;
  const { pathname } = useLocation();
  const loadedRef = useRef(false);
  const visible = shouldShowFreshchat(pathname);

  // Always sync visibility on route change (covers widgets injected before React boots).
  useEffect(() => {
    setFreshchatVisibility(visible);
    whenWidgetReady(applyRouteVisibility);
  }, [pathname, visible]);

  useEffect(() => {
    if (!scriptSrc || !visible) return;

    if (!loadedRef.current) {
      return scheduleIdle(() => {
        if (loadedRef.current) return;
        if (!shouldShowFreshchat(window.location.pathname)) return;
        injectFreshchatScript(scriptSrc);
        loadedRef.current = true;
      });
    }

    setFreshchatVisibility(true);
  }, [scriptSrc, visible]);

  return null;
};
