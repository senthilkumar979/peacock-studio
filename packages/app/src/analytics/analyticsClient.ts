import { createConsoleSink } from './consoleSink';
import type { AnalyticsProps, AnalyticsSink } from './types';

let sink: AnalyticsSink = createConsoleSink();
let isEnabled = false;
let isInitialized = false;

/** Replace the default sink with a real provider before enabling analytics. */
export function setAnalyticsSink(next: AnalyticsSink): void {
  sink = next;
}

/** Enable analytics after the user has granted consent. Idempotent. */
export function enableAnalytics(): void {
  if (isEnabled) return;
  isEnabled = true;
  if (!isInitialized) {
    sink.init();
    isInitialized = true;
  }
}

/** Disable analytics when consent is withdrawn or absent. Idempotent. */
export function disableAnalytics(): void {
  if (!isEnabled) return;
  isEnabled = false;
  if (isInitialized) {
    sink.shutdown();
    isInitialized = false;
  }
}

export function isAnalyticsEnabled(): boolean {
  return isEnabled;
}

export function trackEvent(name: string, props?: AnalyticsProps): void {
  if (!isEnabled) return;
  sink.track(name, props);
}

export function trackPageView(path: string): void {
  if (!isEnabled) return;
  sink.page(path);
}
