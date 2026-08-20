import { describe, expect, it } from 'vitest';
import { AnalyticsEvents } from './events';

describe('AnalyticsEvents', () => {
  it('exports stable snake_case / PostHog event names', () => {
    expect(AnalyticsEvents.pageView).toBe('$pageview');
    expect(AnalyticsEvents.documentFirstSaved).toBe('document_first_saved');
    expect(AnalyticsEvents.consentAccepted).toBe('consent_accepted');
    expect(AnalyticsEvents.acquisitionContextCaptured).toBe(
      'acquisition_context_captured',
    );
  });

  it('keeps all values unique strings', () => {
    const values = Object.values(AnalyticsEvents);
    expect(values.every((value) => typeof value === 'string' && value.length > 0)).toBe(
      true,
    );
    expect(new Set(values).size).toBe(values.length);
  });
});
