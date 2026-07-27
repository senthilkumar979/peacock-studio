interface PostHogQueryResponse {
  results?: unknown[][];
  columns?: string[];
  error?: string;
}

export interface AcquisitionSourceRow {
  source: string;
  signups: number;
}

export interface AcquisitionCampaignRow {
  source: string;
  medium: string;
  campaign: string;
  signups: number;
}

export interface SuperAdminAcquisitionSummary {
  days: number;
  signupsBySource: AcquisitionSourceRow[];
  topCampaigns: AcquisitionCampaignRow[];
  posthogProjectUrl: string;
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function getEnv(name: string, fallback?: string): string | undefined {
  return process.env[name] ?? fallback;
}

async function verifySuperAdmin(authHeader: string): Promise<boolean> {
  const supabaseUrl = getEnv('SUPABASE_URL', getEnv('VITE_SUPABASE_URL'));
  const anonKey = getEnv('SUPABASE_ANON_KEY', getEnv('VITE_SUPABASE_ANON_KEY'));
  if (!supabaseUrl || !anonKey) return false;

  const response = await fetch(`${supabaseUrl}/functions/v1/platform-admin`, {
    method: 'POST',
    headers: {
      Authorization: authHeader,
      apikey: anonKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ action: 'whoami' }),
  });

  if (!response.ok) return false;
  const data = (await response.json()) as { isSuperAdmin?: boolean };
  return Boolean(data.isSuperAdmin);
}

async function runHogQlQuery(query: string, name: string): Promise<PostHogQueryResponse> {
  const apiKey = getEnv('POSTHOG_PERSONAL_API_KEY');
  const projectId = getEnv('POSTHOG_PROJECT_ID', '229575');
  const host = getEnv('POSTHOG_HOST', 'https://eu.posthog.com')?.replace(/\/$/, '');

  if (!apiKey) {
    throw new Error('POSTHOG_PERSONAL_API_KEY is not configured');
  }

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

  const payload = (await response.json()) as PostHogQueryResponse & { detail?: string };
  if (!response.ok) {
    throw new Error(payload.detail || payload.error || 'PostHog query failed');
  }

  return payload;
}

function mapSourceRows(results: unknown[][] | undefined): AcquisitionSourceRow[] {
  if (!results) return [];
  return results
    .map((row) => ({
      source: String(row[0] ?? 'unknown'),
      signups: Number(row[1] ?? 0),
    }))
    .filter((row) => row.signups > 0);
}

function mapCampaignRows(results: unknown[][] | undefined): AcquisitionCampaignRow[] {
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

export default async function handler(request: Request): Promise<Response> {
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Authorization, Content-Type',
      },
    });
  }

  if (request.method !== 'GET') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return jsonResponse({ error: 'Unauthorized' }, 401);
  }

  const isSuperAdmin = await verifySuperAdmin(authHeader);
  if (!isSuperAdmin) {
    return jsonResponse({ error: 'Forbidden' }, 403);
  }

  const url = new URL(request.url);
  const days = Math.min(Math.max(Number(url.searchParams.get('days') ?? 30), 1), 90);
  const host = getEnv('POSTHOG_HOST', 'https://eu.posthog.com')?.replace(/\/$/, '');
  const projectId = getEnv('POSTHOG_PROJECT_ID', '229575');

  try {
    const signupEvents = "('workspace_created_personal', 'workspace_created_team')";
    const [bySource, byCampaign] = await Promise.all([
      runHogQlQuery(
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

    const summary: SuperAdminAcquisitionSummary = {
      days,
      signupsBySource: mapSourceRows(bySource.results),
      topCampaigns: mapCampaignRows(byCampaign.results),
      posthogProjectUrl: `${host}/project/${projectId}/dashboard/851989`,
    };

    return jsonResponse(summary);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Acquisition query failed';
    return jsonResponse({ error: message }, 500);
  }
}
