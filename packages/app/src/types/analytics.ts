/** Org-scoped product event names recorded via `record_org_event`. */
export type OrgAnalyticsEventType =
  | 'pdf_export'
  | 'document_view'
  | 'tour_view'
  | 'tour_complete'
  | 'share_link_created';

/** Public share event names recorded via `record_share_event`. */
export type ShareAnalyticsEventType = 'share_view' | 'embed_view';

export interface AnalyticsTotals {
  views: number;
  embedViews: number;
  pdfExports: number;
}

export interface AnalyticsByTypeEntry {
  eventType: string;
  count: number;
}

export interface AnalyticsDailyEntry {
  day: string;
  views: number;
}

export interface AnalyticsReferrerEntry {
  referrerDomain: string;
  count: number;
}

export interface OrgAnalyticsSummary {
  totals: AnalyticsTotals;
  byType: AnalyticsByTypeEntry[];
  daily: AnalyticsDailyEntry[];
  topReferrers: AnalyticsReferrerEntry[];
}

export const EMPTY_ANALYTICS_SUMMARY: OrgAnalyticsSummary = {
  totals: { views: 0, embedViews: 0, pdfExports: 0 },
  byType: [],
  daily: [],
  topReferrers: [],
};
