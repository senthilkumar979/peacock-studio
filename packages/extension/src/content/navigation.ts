import type { NavigationEvent } from '@peacock/shared';
import { createId } from '@peacock/shared';

let lastUrl = location.href;

export function initNavigationTracking(onNavigation: (event: NavigationEvent) => void): void {
  const emitNavigation = (toUrl: string) => {
    if (toUrl === lastUrl) return;

    const event: NavigationEvent = {
      id: createId(),
      type: 'navigation',
      timestamp: Date.now(),
      fromUrl: lastUrl,
      toUrl,
    };

    lastUrl = toUrl;
    onNavigation(event);
  };

  const originalPushState = history.pushState.bind(history);
  history.pushState = (...args) => {
    originalPushState(...args);
    emitNavigation(location.href);
  };

  const originalReplaceState = history.replaceState.bind(history);
  history.replaceState = (...args) => {
    originalReplaceState(...args);
    emitNavigation(location.href);
  };

  window.addEventListener('popstate', () => emitNavigation(location.href));
}
