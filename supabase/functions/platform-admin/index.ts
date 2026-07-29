// Supabase Edge Function: platform super-admin read-only stats.
// Deploy with verify_jwt=false — Clerk third-party JWTs fail the legacy gateway check.
// Auth: caller Bearer → resolve_actor_email RPC → match SUPER_ADMIN_EMAILS secret.
// Secrets: SUPER_ADMIN_EMAILS (comma-separated), SUPABASE_URL, SUPABASE_ANON_KEY,
//          SUPABASE_SERVICE_ROLE_KEY, APP_ORIGIN (CORS),
//          POSTHOG_PERSONAL_API_KEY (+ optional POSTHOG_PROJECT_ID, POSTHOG_HOST) for acquisition

import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient, type SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';
import { corsHeaders } from '../_shared/cors.ts';
import { buildAcquisitionSummary } from './acquisition.ts';

type Action =
  | 'whoami'
  | 'overview'
  | 'listOrganizations'
  | 'getOrganization'
  | 'acquisition';

interface RequestBody {
  action?: Action;
  organizationId?: string;
  days?: number;
}

interface DomainRow {
  domain: string;
  count: number;
}

serve(async (req) => {
  const cors = corsHeaders(req);
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: cors });
  }

  try {
    if (req.method !== 'POST') {
      return json({ error: 'Method not allowed' }, 405, cors);
    }

    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return json({ error: 'Unauthorized' }, 401, cors);
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!supabaseUrl || !supabaseAnonKey || !serviceRoleKey) {
      return json({ error: 'Server misconfigured' }, 500, cors);
    }

    const body = (await req.json().catch(() => ({}))) as RequestBody;
    const action = body.action;
    if (!action || !isAction(action)) {
      return json({ error: 'Invalid action' }, 400, cors);
    }

    const callerEmail = await resolveCallerEmail(supabaseUrl, supabaseAnonKey, authHeader);
    const isSuperAdmin = isEmailAllowlisted(callerEmail);

    if (action === 'whoami') {
      return json({ isSuperAdmin }, 200, cors);
    }

    if (!isSuperAdmin) {
      return json({ error: 'Forbidden' }, 403, cors);
    }

    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    if (action === 'overview') {
      return json(await buildOverview(admin), 200, cors);
    }

    if (action === 'listOrganizations') {
      return json({ organizations: await listOrganizations(admin) }, 200, cors);
    }

    if (action === 'acquisition') {
      try {
        const summary = await buildAcquisitionSummary(body.days);
        return json(summary as unknown as Record<string, unknown>, 200, cors);
      } catch (acquisitionError) {
        const message =
          acquisitionError instanceof Error
            ? acquisitionError.message
            : 'Acquisition query failed';
        return json({ error: message }, 500, cors);
      }
    }

    const organizationId = body.organizationId?.trim();
    if (!organizationId) {
      return json({ error: 'Missing organizationId' }, 400, cors);
    }

    const detail = await getOrganization(admin, organizationId);
    if (!detail) {
      return json({ error: 'Organization not found' }, 404, cors);
    }
    return json(detail, 200, cors);
  } catch (error) {
    console.error(error);
    return json({ error: 'Internal error' }, 500, cors);
  }
});

function isAction(value: string): value is Action {
  return (
    value === 'whoami' ||
    value === 'overview' ||
    value === 'listOrganizations' ||
    value === 'getOrganization' ||
    value === 'acquisition'
  );
}

function parseAllowlist(): Set<string> {
  const raw = Deno.env.get('SUPER_ADMIN_EMAILS')?.trim() ?? '';
  if (!raw) return new Set();
  return new Set(
    raw
      .split(',')
      .map((part) => part.trim().toLowerCase())
      .filter(Boolean),
  );
}

function isEmailAllowlisted(email: string | null): boolean {
  if (!email) return false;
  return parseAllowlist().has(email.trim().toLowerCase());
}

async function resolveCallerEmail(
  supabaseUrl: string,
  anonKey: string,
  authHeader: string,
): Promise<string | null> {
  const response = await fetch(`${supabaseUrl}/rest/v1/rpc/resolve_actor_email`, {
    method: 'POST',
    headers: {
      Authorization: authHeader,
      apikey: anonKey,
      'Content-Type': 'application/json',
    },
    body: '{}',
  });

  if (!response.ok) return null;

  const payload = await response.json();
  if (typeof payload === 'string' && payload.trim()) {
    return payload.trim().toLowerCase();
  }
  return null;
}

async function buildOverview(admin: SupabaseClient) {
  const [
    orgsRes,
    membersRes,
    docsRes,
    toursRes,
    sharesRes,
    domainDocsRes,
  ] = await Promise.all([
    admin.from('organizations').select('id, storage_bytes'),
    admin.from('organization_members').select('clerk_user_id').eq('status', 'active'),
    admin.from('flow_documents').select('id', { count: 'exact', head: true }),
    admin.from('product_tours').select('id', { count: 'exact', head: true }),
    admin
      .from('share_links')
      .select('id', { count: 'exact', head: true })
      .is('revoked_at', null),
    admin.from('flow_documents').select('domain_counts'),
  ]);

  if (orgsRes.error) throw orgsRes.error;
  if (membersRes.error) throw membersRes.error;
  if (docsRes.error) throw docsRes.error;
  if (toursRes.error) throw toursRes.error;
  if (sharesRes.error) throw sharesRes.error;
  if (domainDocsRes.error) throw domainDocsRes.error;

  const orgs = orgsRes.data ?? [];
  const distinctUsers = new Set(
    (membersRes.data ?? [])
      .map((row) => String(row.clerk_user_id ?? ''))
      .filter(Boolean),
  );

  const totalStorageBytes = orgs.reduce(
    (sum, row) => sum + Number(row.storage_bytes ?? 0),
    0,
  );

  const topDomains = aggregateDomains(
    (domainDocsRes.data ?? []).map((row) => row.domain_counts),
  ).slice(0, 20);

  return {
    organizationCount: orgs.length,
    userCount: distinctUsers.size,
    documentCount: docsRes.count ?? 0,
    tourCount: toursRes.count ?? 0,
    activeShareLinkCount: sharesRes.count ?? 0,
    totalStorageBytes,
    topDomains,
  };
}

async function listOrganizations(admin: SupabaseClient) {
  const [orgsRes, membersRes, docsRes, toursRes] = await Promise.all([
    admin
      .from('organizations')
      .select(
        'id, name, workspace_type, plan, owner_email, storage_bytes, created_at',
      )
      .order('created_at', { ascending: false }),
    admin.from('organization_members').select('organization_id').eq('status', 'active'),
    admin.from('flow_documents').select('organization_id'),
    admin.from('product_tours').select('organization_id'),
  ]);

  if (orgsRes.error) throw orgsRes.error;
  if (membersRes.error) throw membersRes.error;
  if (docsRes.error) throw docsRes.error;
  if (toursRes.error) throw toursRes.error;

  const memberCounts = countByOrg(membersRes.data ?? [], 'organization_id');
  const docCounts = countByOrg(docsRes.data ?? [], 'organization_id');
  const tourCounts = countByOrg(toursRes.data ?? [], 'organization_id');

  return (orgsRes.data ?? []).map((org) => {
    const id = String(org.id);
    return {
      id,
      name: String(org.name ?? 'Organization'),
      workspaceType: org.workspace_type === 'team' ? 'team' : 'personal',
      plan: String(org.plan ?? 'free'),
      ownerEmail: org.owner_email ? String(org.owner_email) : null,
      memberCount: memberCounts.get(id) ?? 0,
      documentCount: docCounts.get(id) ?? 0,
      tourCount: tourCounts.get(id) ?? 0,
      storageBytes: Number(org.storage_bytes ?? 0),
      createdAt: String(org.created_at ?? ''),
    };
  });
}

async function getOrganization(admin: SupabaseClient, organizationId: string) {
  const orgRes = await admin
    .from('organizations')
    .select(
      'id, name, workspace_type, plan, owner_email, storage_bytes, created_at, website',
    )
    .eq('id', organizationId)
    .maybeSingle();

  if (orgRes.error) throw orgRes.error;
  if (!orgRes.data) return null;

  const [membersRes, docsRes, toursRes, domainsRes, assetsRes] = await Promise.all([
    admin
      .from('organization_members')
      .select('email, role, status, joined_at, clerk_user_id')
      .eq('organization_id', organizationId)
      .order('joined_at', { ascending: true }),
    admin
      .from('flow_documents')
      .select('id', { count: 'exact', head: true })
      .eq('organization_id', organizationId),
    admin
      .from('product_tours')
      .select('id', { count: 'exact', head: true })
      .eq('organization_id', organizationId),
    admin
      .from('flow_documents')
      .select('domain_counts')
      .eq('organization_id', organizationId),
    admin
      .from('screenshot_assets')
      .select('byte_size, created_by')
      .eq('organization_id', organizationId),
  ]);

  if (membersRes.error) throw membersRes.error;
  if (docsRes.error) throw docsRes.error;
  if (toursRes.error) throw toursRes.error;
  if (domainsRes.error) throw domainsRes.error;
  if (assetsRes.error) throw assetsRes.error;

  const members = membersRes.data ?? [];
  const emails = members.map((m) => String(m.email ?? '').toLowerCase()).filter(Boolean);

  const profilesRes =
    emails.length > 0
      ? await admin.from('user_profiles').select('email, display_name').in('email', emails)
      : { data: [], error: null };

  if (profilesRes.error) throw profilesRes.error;

  const displayByEmail = new Map(
    (profilesRes.data ?? []).map((row) => [
      String(row.email).toLowerCase(),
      String(row.display_name ?? row.email),
    ]),
  );

  const storageByEmail = new Map<string, number>();
  let assetsStorageBytes = 0;
  for (const asset of assetsRes.data ?? []) {
    const bytes = Number(asset.byte_size ?? 0);
    assetsStorageBytes += bytes;
    const email = asset.created_by ? String(asset.created_by).toLowerCase() : '';
    if (!email) continue;
    storageByEmail.set(email, (storageByEmail.get(email) ?? 0) + bytes);
  }

  const domains = aggregateDomains(
    (domainsRes.data ?? []).map((row) => row.domain_counts),
  );

  return {
    id: String(orgRes.data.id),
    name: String(orgRes.data.name ?? 'Organization'),
    workspaceType: orgRes.data.workspace_type === 'team' ? 'team' : 'personal',
    plan: String(orgRes.data.plan ?? 'free'),
    ownerEmail: orgRes.data.owner_email ? String(orgRes.data.owner_email) : null,
    website: orgRes.data.website ? String(orgRes.data.website) : null,
    storageBytes: Number(orgRes.data.storage_bytes ?? 0),
    assetsStorageBytes,
    createdAt: String(orgRes.data.created_at ?? ''),
    documentCount: docsRes.count ?? 0,
    tourCount: toursRes.count ?? 0,
    domains,
    members: members.map((member) => {
      const email = String(member.email ?? '').toLowerCase();
      return {
        email,
        displayName: displayByEmail.get(email) ?? email,
        role: member.role === 'admin' ? 'admin' : 'member',
        status: member.status === 'disabled' ? 'disabled' : 'active',
        joinedAt: String(member.joined_at ?? ''),
        storageBytes: storageByEmail.get(email) ?? 0,
      };
    }),
  };
}

function countByOrg(
  rows: Array<Record<string, unknown>>,
  key: string,
): Map<string, number> {
  const counts = new Map<string, number>();
  for (const row of rows) {
    const id = String(row[key] ?? '');
    if (!id) continue;
    counts.set(id, (counts.get(id) ?? 0) + 1);
  }
  return counts;
}

function aggregateDomains(domainCountsList: unknown[]): DomainRow[] {
  const totals = new Map<string, number>();
  for (const raw of domainCountsList) {
    if (!raw || typeof raw !== 'object') continue;
    for (const [domain, value] of Object.entries(raw as Record<string, unknown>)) {
      const count = Number(value);
      if (!domain || !Number.isFinite(count) || count <= 0) continue;
      totals.set(domain, (totals.get(domain) ?? 0) + count);
    }
  }

  return Array.from(totals.entries())
    .map(([domain, count]) => ({ domain, count }))
    .sort((a, b) => b.count - a.count || a.domain.localeCompare(b.domain));
}

function json(
  payload: Record<string, unknown>,
  status: number,
  cors: Record<string, string>,
): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json' },
  });
}
