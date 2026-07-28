import { createConsoleSink } from './consoleSink';
import { AnalyticsEvents } from './events';
import type { AnalyticsProps, AnalyticsSink } from './types';
import {
  readAcquisitionContext,
  toAcquisitionTraits,
} from '@/utils/acquisitionContext';

let sink: AnalyticsSink = createConsoleSink();
let isEnabled = false;
let isInitialized = false;

const FIRST_SAVED_DOCS_KEY = 'peacock-analytics-first-saved-docs';

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

/** Capture an exception for PostHog Error Tracking (consent-gated). */
export function trackException(error: unknown, props?: AnalyticsProps): void {
  if (!isEnabled) return;
  sink.captureException?.(error, props);
}

/** Identify the signed-in user for person profiles / funnel attribution. */
export function identifyAnalyticsUser(userId: string, traits?: AnalyticsProps): void {
  if (!isEnabled) return;
  sink.identify?.(userId, traits);
}

/** Associate the session with a B2B group (organization). */
export function groupAnalytics(
  groupType: string,
  groupKey: string,
  properties?: AnalyticsProps,
): void {
  if (!isEnabled) return;
  sink.group?.(groupType, groupKey, properties);
}

/**
 * Registers first-touch acquisition traits as PostHog super properties and emits
 * a one-time capture event. No-op when analytics is disabled or context is empty.
 */
export function flushAcquisitionToAnalytics(): void {
  if (!isEnabled) return;

  const traits = toAcquisitionTraits(readAcquisitionContext());
  if (Object.keys(traits).length === 0) return;

  sink.registerSuperProperties?.(traits);
  sink.track(AnalyticsEvents.acquisitionContextCaptured, traits);
}

/** Clear identity on sign-out. */
export function resetAnalyticsUser(): void {
  if (!isEnabled) return;
  sink.reset?.();
}

function readFirstSavedDocIds(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = window.sessionStorage.getItem(FIRST_SAVED_DOCS_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((id): id is string => typeof id === 'string'));
  } catch {
    return new Set();
  }
}

function writeFirstSavedDocIds(ids: Set<string>): void {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.setItem(FIRST_SAVED_DOCS_KEY, JSON.stringify([...ids]));
  } catch {
    // Ignore quota / private-mode failures.
  }
}

/**
 * Emits `document_first_saved` at most once per document per browser session.
 * Use this for activation funnels instead of high-volume autosave events.
 */
export function trackDocumentFirstSaved(
  documentId: string,
  props?: AnalyticsProps,
): void {
  if (!isEnabled || !documentId) return;
  const seen = readFirstSavedDocIds();
  if (seen.has(documentId)) return;
  seen.add(documentId);
  writeFirstSavedDocIds(seen);
  sink.track(AnalyticsEvents.documentFirstSaved, {
    document_id: documentId,
    ...props,
  });
}
