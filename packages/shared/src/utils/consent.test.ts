import { describe, expect, it } from 'vitest';
import {
  CONSENT_POLICY_VERSION,
  createConsentRecord,
  isAnalyticsAllowed,
  needsConsentDecision,
  parseConsentRecord,
} from './consent';

describe('consent', () => {
  it('creates a record at the current policy version with a timestamp', () => {
    const record = createConsentRecord(true);

    expect(record.version).toBe(CONSENT_POLICY_VERSION);
    expect(record.analytics).toBe(true);
    expect(Number.isNaN(Date.parse(record.decidedAt))).toBe(false);
  });

  it('parses a valid stored record', () => {
    const raw = JSON.stringify({ version: 1, decidedAt: '2026-01-01T00:00:00.000Z', analytics: false });

    expect(parseConsentRecord(raw)).toEqual({
      version: 1,
      decidedAt: '2026-01-01T00:00:00.000Z',
      analytics: false,
    });
  });

  it('returns null for missing, malformed, or incomplete records', () => {
    expect(parseConsentRecord(null)).toBeNull();
    expect(parseConsentRecord('not json')).toBeNull();
    expect(parseConsentRecord('{"version":1}')).toBeNull();
    expect(parseConsentRecord('{"version":"1","decidedAt":"x","analytics":true}')).toBeNull();
  });

  it('requires a decision when none exists or the policy version advanced', () => {
    expect(needsConsentDecision(null)).toBe(true);
    expect(needsConsentDecision({ version: 0, decidedAt: 'x', analytics: false }, 1)).toBe(true);
    expect(needsConsentDecision({ version: 1, decidedAt: 'x', analytics: false }, 1)).toBe(false);
  });

  it('reports analytics permission only when explicitly granted', () => {
    expect(isAnalyticsAllowed(null)).toBe(false);
    expect(isAnalyticsAllowed({ version: 1, decidedAt: 'x', analytics: false })).toBe(false);
    expect(isAnalyticsAllowed({ version: 1, decidedAt: 'x', analytics: true })).toBe(true);
  });
});
