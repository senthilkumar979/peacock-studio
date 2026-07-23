export type AnalyticsProps = Record<string, unknown>;

/**
 * Provider-agnostic analytics seam. Swap the default sink for a real provider
 * (PostHog, GA, etc.) via `setAnalyticsSink` — the consent gating in
 * `analyticsClient` stays the same regardless of provider.
 */
export interface AnalyticsSink {
  init: () => void;
  shutdown: () => void;
  track: (name: string, props?: AnalyticsProps) => void;
  page: (path: string) => void;
  /** Optional: Error Tracking / exception capture. */
  captureException?: (error: unknown, props?: AnalyticsProps) => void;
  identify?: (userId: string, traits?: AnalyticsProps) => void;
  reset?: () => void;
}
