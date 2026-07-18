import type { ConsentRecord } from '../types/consent';

/** Bump when the set of categories or their meaning changes, to force re-consent. */
export const CONSENT_POLICY_VERSION = 1;

export function createConsentRecord(analytics: boolean): ConsentRecord {
  return {
    version: CONSENT_POLICY_VERSION,
    decidedAt: new Date().toISOString(),
    analytics,
  };
}

export function parseConsentRecord(raw: string | null): ConsentRecord | null {
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Partial<ConsentRecord> | null;
    if (
      !parsed ||
      typeof parsed !== 'object' ||
      typeof parsed.version !== 'number' ||
      typeof parsed.decidedAt !== 'string' ||
      typeof parsed.analytics !== 'boolean'
    ) {
      return null;
    }

    return {
      version: parsed.version,
      decidedAt: parsed.decidedAt,
      analytics: parsed.analytics,
    };
  } catch {
    return null;
  }
}

/** True when there is no valid decision yet, or it predates the current policy. */
export function needsConsentDecision(
  record: ConsentRecord | null,
  version: number = CONSENT_POLICY_VERSION,
): boolean {
  if (!record) return true;
  return record.version < version;
}

export function isAnalyticsAllowed(record: ConsentRecord | null): boolean {
  return Boolean(record?.analytics);
}
