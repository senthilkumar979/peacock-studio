import { getReferrerDomain, getUtmParams } from '@/utils/referrer';
import type { AnalyticsProps } from '@/analytics/types';

export const ACQUISITION_STORAGE_KEY = 'peacock-acquisition-pending';

export interface AcquisitionContext {
  acquisition_source: string;
  acquisition_medium: string | null;
  acquisition_campaign: string | null;
  acquisition_content: string | null;
  initial_referrer_domain: string | null;
  initial_landing_path: string;
  initial_landing_at: string;
}

export interface AcquisitionTraits {
  acquisition_source: string;
  acquisition_medium: string | null;
  acquisition_campaign: string | null;
  acquisition_content: string | null;
  initial_referrer_domain: string | null;
  initial_landing_path: string;
  initial_landing_at: string;
}

function deriveAcquisitionSource(
  utmSource: string | undefined,
  referrerDomain: string | null,
): string {
  if (utmSource) return utmSource;
  if (referrerDomain) return referrerDomain;
  return 'direct';
}

/** Builds acquisition context from URL, referrer, and path (pure, testable). */
export function buildAcquisitionContext(input: {
  utmParams: Record<string, string>;
  referrerDomain: string | null;
  landingPath: string;
  capturedAt?: string;
}): AcquisitionContext {
  const utmSource = input.utmParams.utm_source;
  const referrerDomain = input.referrerDomain;

  return {
    acquisition_source: deriveAcquisitionSource(utmSource, referrerDomain),
    acquisition_medium: input.utmParams.utm_medium ?? null,
    acquisition_campaign: input.utmParams.utm_campaign ?? null,
    acquisition_content: input.utmParams.utm_content ?? null,
    initial_referrer_domain: referrerDomain,
    initial_landing_path: input.landingPath,
    initial_landing_at: input.capturedAt ?? new Date().toISOString(),
  };
}

function readStoredContext(): AcquisitionContext | null {
  if (typeof window === 'undefined') return null;

  try {
    const raw = window.sessionStorage.getItem(ACQUISITION_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AcquisitionContext;
  } catch {
    return null;
  }
}

function persistContext(context: AcquisitionContext): void {
  try {
    window.sessionStorage.setItem(ACQUISITION_STORAGE_KEY, JSON.stringify(context));
  } catch {
    // Ignore quota/private-mode failures.
  }
}

/**
 * Captures first-touch acquisition context in sessionStorage. First write wins;
 * subsequent calls are no-ops so UTMs survive SPA navigation before consent.
 */
export function captureAcquisitionContext(): AcquisitionContext | null {
  if (typeof window === 'undefined') return null;

  const existing = readStoredContext();
  if (existing) return existing;

  const context = buildAcquisitionContext({
    utmParams: getUtmParams(),
    referrerDomain: getReferrerDomain(),
    landingPath: window.location.pathname,
  });

  persistContext(context);
  return context;
}

/** Returns stored first-touch acquisition context, if any. */
export function readAcquisitionContext(): AcquisitionContext | null {
  return readStoredContext();
}

/** Flat traits safe for PostHog identify / register_once. */
export function toAcquisitionTraits(context: AcquisitionContext | null): AnalyticsProps {
  if (!context) return {};
  return { ...context };
}
