interface PostHogQueryResponse {
  results?: unknown[][];
  error?: string;
  detail?: string;
}

export interface AcquisitionSummary {
  days: number;
  signupsBySource: Array<{ source: string; signups: number }>;
  topCampaigns: Array<{
    source: string;
    medium: string;
    campaign: string;
    signups: number;
  }>;
  posthogProjectUrl: string;
}

export async function buildAcquisitionSummary(daysInput?: number): Promise<AcquisitionSummary> {
  const days = Math.min(Math.max(Number(daysInput ?? 30), 1), 90);
  const apiKey = Deno.env.get('POSTHOG_PERSONAL_API_KEY')?.trim();
  const projectId = Deno.env.get('POSTHOG_PROJECT_ID')?.trim() || '229575';
  const host = (Deno.env.get('POSTHOG_HOST')?.trim() || 'https://eu.posthog.com').replace(
    /\/$/,
    '',
  );

  if (!apiKey) {
    throw new Error('POSTHOG_PERSONAL_API_KEY is not configured');
  }

  const signupEvents = "('workspace_created_personal', 'workspace_created_team')";
  const [bySource, byCampaign] = await Promise.all([
    runHogQlQuery(
      host,
      projectId,
      apiKey,
      `SELECT properties.acquisition_source AS source, count() AS signups
       FROM events
       WHERE event IN ${signupEvents}
         AND timestamp >= now() - INTERVAL ${days} DAY
         AND properties.acquisition_source IS NOT NULL
       GROUP BY source
       ORDER BY signups DESC
       LIMIT 20`,
      `acquisition_signups_by_source_${days}d`,
    ),
    runHogQlQuery(
      host,
      projectId,
      apiKey,
      `SELECT
         properties.acquisition_source AS source,
         coalesce(properties.acquisition_medium, '—') AS medium,
         coalesce(properties.acquisition_campaign, '—') AS campaign,
         count() AS signups
       FROM events
       WHERE event IN ${signupEvents}
         AND timestamp >= now() - INTERVAL ${days} DAY
         AND properties.acquisition_source IS NOT NULL
       GROUP BY source, medium, campaign
       ORDER BY signups DESC
       LIMIT 25`,
      `acquisition_campaigns_${days}d`,
    ),
  ]);

  return {
    days,
    signupsBySource: mapSourceRows(bySource.results),
    topCampaigns: mapCampaignRows(byCampaign.results),
    posthogProjectUrl: `${host}/project/${projectId}/dashboard/851989`,
  };
}

async function runHogQlQuery(
  host: string,
  projectId: string,
  apiKey: string,
  query: string,
  name: string,
): Promise<PostHogQueryResponse> {
  const response = await fetch(`${host}/api/projects/${projectId}/query/`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name,
      refresh: 'blocking',
      query: {
        kind: 'HogQLQuery',
        query,
      },
    }),
  });

  const payload = (await response.json()) as PostHogQueryResponse;
  if (!response.ok) {
    throw new Error(payload.detail || payload.error || 'PostHog query failed');
  }

  return payload;
}

function mapSourceRows(results: unknown[][] | undefined) {
  if (!results) return [];
  return results
    .map((row) => ({
      source: String(row[0] ?? 'unknown'),
      signups: Number(row[1] ?? 0),
    }))
    .filter((row) => row.signups > 0);
}

function mapCampaignRows(results: unknown[][] | undefined) {
  if (!results) return [];
  return results
    .map((row) => ({
      source: String(row[0] ?? 'unknown'),
      medium: String(row[1] ?? '—'),
      campaign: String(row[2] ?? '—'),
      signups: Number(row[3] ?? 0),
    }))
    .filter((row) => row.signups > 0);
}
