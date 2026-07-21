import { getCloudAuthContext } from '@/cloud/authContext';
import { getPublicSupabaseClient } from '@/cloud/publicSupabaseClient';
import { getAuthenticatedSupabaseClient } from '@/cloud/supabaseClient';
import {
  EMPTY_ANALYTICS_SUMMARY,
  type OrgAnalyticsEventType,
  type OrgAnalyticsSummary,
  type ShareAnalyticsEventType,
} from '@/types/analytics';

/**
 * Records a public share/embed view via a security-definer RPC. The server
 * derives the organization from the share token, so this is safe to call from
 * anonymous (public share) sessions. Best-effort: failures never bubble to the
 * viewer experience.
 */
export async function recordShareEvent(
  token: string,
  eventType: ShareAnalyticsEventType,
  referrerDomain: string | null,
  metadata: Record<string, unknown> = {},
): Promise<void> {
  try {
    const supabase = getPublicSupabaseClient();
    await supabase.rpc('record_share_event', {
      p_token: token,
      p_event_type: eventType,
      p_referrer_domain: referrerDomain,
      p_metadata: metadata,
    });
  } catch {
    // Analytics must never break the shared view.
  }
}

/**
 * Records an authenticated, org-scoped product event (e.g. a PDF export).
 * No-op when the cloud library is not active. Best-effort.
 */
export async function recordOrgEvent(
  eventType: OrgAnalyticsEventType,
  options: {
    resourceType?: string;
    resourceId?: string;
    metadata?: Record<string, unknown>;
  } = {},
): Promise<void> {
  const context = getCloudAuthContext();
  if (!context) return;

  try {
    const supabase = getAuthenticatedSupabaseClient();
    await supabase.rpc('record_org_event', {
      p_organization_id: context.organizationId,
      p_event_type: eventType,
      p_resource_type: options.resourceType ?? null,
      p_resource_id: options.resourceId ?? null,
      p_metadata: options.metadata ?? {},
    });
  } catch {
    // Best-effort telemetry.
  }
}

/**
 * Fetches the aggregated analytics summary for the active organization over the
 * last `days` days. Returns an empty summary when cloud is inactive or on error
 * so the dashboard can render gracefully.
 */
export async function fetchOrgAnalyticsSummary(days = 30): Promise<OrgAnalyticsSummary> {
  const context = getCloudAuthContext();
  if (!context) return EMPTY_ANALYTICS_SUMMARY;

  const supabase = getAuthenticatedSupabaseClient();
  const { data, error } = await supabase.rpc('get_org_analytics_summary', {
    p_organization_id: context.organizationId,
    p_days: days,
  });

  if (error) throw error;
  if (!data) return EMPTY_ANALYTICS_SUMMARY;

  return data as OrgAnalyticsSummary;
}
