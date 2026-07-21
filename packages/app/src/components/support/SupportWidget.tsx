import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { getTawkConfig } from '@/analytics/config';

const TAWK_SCRIPT_ID = 'tawk-to-embed';

function injectTawkScript(propertyId: string, widgetId: string): void {
  if (document.getElementById(TAWK_SCRIPT_ID)) return;

  window.Tawk_API = window.Tawk_API || {};
  window.Tawk_LoadStart = new Date();

  const script = document.createElement('script');
  script.id = TAWK_SCRIPT_ID;
  script.async = true;
  script.src = `https://embed.tawk.to/${propertyId}/${widgetId}`;
  script.charset = 'UTF-8';
  script.setAttribute('crossorigin', '*');
  document.body.appendChild(script);
}

/** Public share routes should not surface the internal support widget. */
function isPublicRoute(pathname: string): boolean {
  return pathname.startsWith('/s/');
}

/**
 * Loads the Tawk.to live-chat widget when configured and toggles its
 * visibility so it never appears on public share pages. Renders nothing.
 */
export const SupportWidget = () => {
  const config = getTawkConfig();
  const location = useLocation();
  const loadedRef = useRef(false);

  useEffect(() => {
    if (!config || loadedRef.current) return;
    injectTawkScript(config.propertyId, config.widgetId);
    loadedRef.current = true;
  }, [config]);

  useEffect(() => {
    if (!config) return;
    const hidden = isPublicRoute(location.pathname);

    const applyVisibility = () => {
      if (hidden) window.Tawk_API?.hideWidget?.();
      else window.Tawk_API?.showWidget?.();
    };

    // The API methods only exist once the widget finishes loading.
    if (window.Tawk_API?.showWidget) {
      applyVisibility();
    } else {
      window.Tawk_API = window.Tawk_API || {};
      window.Tawk_API.onLoad = applyVisibility;
    }
  }, [config, location.pathname]);

  return null;
};
