import { describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '@/test/renderWithProviders';
import { EMPTY_ANALYTICS_SUMMARY } from '@/types/analytics';

vi.mock('@/hooks/useConsent', () => ({
  useConsent: () => ({ isAnalyticsAllowed: false }),
}));

vi.mock('@/hooks/useOrganization', () => ({
  useCloudAuthContext: () => null,
}));

vi.mock('@/analytics/analyticsClient', () => ({
  disableAnalytics: vi.fn(),
  enableAnalytics: vi.fn(),
  flushAcquisitionToAnalytics: vi.fn(),
  groupAnalytics: vi.fn(),
  identifyAnalyticsUser: vi.fn(),
  resetAnalyticsUser: vi.fn(),
  setAnalyticsSink: vi.fn(),
  trackEvent: vi.fn(),
  trackPageView: vi.fn(),
}));

vi.mock('@/analytics/config', () => ({
  isPostHogConfigured: () => false,
}));

vi.mock('@/cloud/config', () => ({
  isCloudSyncEnabled: () => false,
}));

import { AnalyticsTracker } from './AnalyticsTracker';
import { AnalyticsCharts } from './AnalyticsCharts';
import { AnalyticsSummaryCards } from './AnalyticsSummaryCards';

const summary = {
  ...EMPTY_ANALYTICS_SUMMARY,
  totals: { views: 10, embedViews: 2, pdfExports: 1 },
  daily: [{ day: '2026-01-01', views: 3 }],
  topReferrers: [{ referrerDomain: 'example.com', count: 2 }],
};

describe('analytics smoke', () => {
  it('AnalyticsTracker renders nothing', () => {
    const { container } = renderWithProviders(<AnalyticsTracker />);
    expect(container).toBeEmptyDOMElement();
  });

  it('AnalyticsCharts headings', () => {
    renderWithProviders(<AnalyticsCharts summary={summary} />);
    expect(screen.getByText('Views over time')).toBeInTheDocument();
  });

  it('AnalyticsSummaryCards totals', () => {
    renderWithProviders(<AnalyticsSummaryCards summary={summary} avgViewsPerDoc={2} />);
    expect(screen.getByText('Total views')).toBeInTheDocument();
  });
});
