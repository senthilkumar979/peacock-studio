import { requireCapability, requireCloudAuthContext } from '@/cloud/authContext';
import { getAuthenticatedSupabaseClient } from '@/cloud/supabaseClient';
import { recordOrgEvent } from '@/cloud/repositories/analyticsRepository';
import type {
  CreateShareLinkInput,
  ShareLinkRecord,
  ShareLinkResourceType,
  ShareLinkSettings,
} from '@/types/shareLink';
import type { ShareLinkChannel } from '@/utils/shareLink';

interface ShareLinkRow {
  id: string;
  token: string;
  organization_id: string;
  resource_type: ShareLinkRecord['resourceType'];
  resource_id: string;
  access_mode: ShareLinkRecord['accessMode'];
  channel?: ShareLinkChannel | null;
  settings: ShareLinkSettings | null;
  requires_auth?: boolean | null;
  expires_at: string | null;
  revoked_at: string | null;
  created_by: string;
  updated_by?: string | null;
  created_at: string;
  updated_at: string;
}

function createShareToken(): string {
  return crypto.randomUUID().replace(/-/g, '');
}

function optionsDiffer(
  existing: ShareLinkRow,
  expiresAt: string | null,
  requiresAuth: boolean,
): boolean {
  const existingExpiry = existing.expires_at ?? null;
  const existingAuth = Boolean(existing.requires_auth);
  return existingExpiry !== expiresAt || existingAuth !== requiresAuth;
}

export async function createOrUpdateShareLink(input: CreateShareLinkInput): Promise<ShareLinkRecord> {
  const channel: ShareLinkChannel = input.channel ?? 'link';
  if (channel === 'embed') {
    requireCapability('embed');
  } else {
    requireCapability('share');
  }

  const { organizationId, userEmail } = requireCloudAuthContext();
  const supabase = getAuthenticatedSupabaseClient();
  const accessMode = channel === 'embed' ? 'readonly' : input.accessMode;
  const expiresAt = input.expiresAt ?? null;
  const requiresAuth = Boolean(input.requiresAuth) && accessMode === 'readonly';
  const settings = input.settings ?? {};
  const now = new Date().toISOString();

  const { data: existing, error: existingError } = await supabase
    .from('share_links')
    .select('*')
    .eq('organization_id', organizationId)
    .eq('resource_type', input.resourceType)
    .eq('resource_id', input.resourceId)
    .eq('access_mode', accessMode)
    .eq('channel', channel)
    .is('revoked_at', null)
    .maybeSingle();

  if (existingError) throw existingError;

  const existingRow = existing as ShareLinkRow | null;

  if (existingRow && !optionsDiffer(existingRow, expiresAt, requiresAuth)) {
    const { data, error } = await supabase
      .from('share_links')
      .update({
        settings,
        updated_at: now,
        updated_by: userEmail,
      })
      .eq('id', existingRow.id)
      .select('*')
      .single();

    if (error) throw error;
    return mapShareLinkRow(data as ShareLinkRow);
  }

  if (existingRow) {
    await supabase
      .from('share_links')
      .update({ revoked_at: now, updated_at: now, updated_by: userEmail })
      .eq('id', existingRow.id);
  }

  const { data, error } = await supabase
    .from('share_links')
    .insert({
      token: createShareToken(),
      organization_id: organizationId,
      resource_type: input.resourceType,
      resource_id: input.resourceId,
      access_mode: accessMode,
      channel,
      settings,
      expires_at: expiresAt,
      requires_auth: requiresAuth,
      created_by: userEmail,
      updated_by: userEmail,
      updated_at: now,
    })
    .select('*')
    .single();

  if (error) throw error;

  void recordOrgEvent('share_link_created', {
    resourceType: input.resourceType,
    resourceId: input.resourceId,
    metadata: { accessMode, channel, requiresAuth, expiresAt },
  });

  return mapShareLinkRow(data as ShareLinkRow);
}

export async function revokeShareLink(id: string): Promise<void> {
  requireCloudAuthContext();
  const supabase = getAuthenticatedSupabaseClient();
  const { error } = await supabase.rpc('revoke_share_link', { p_id: id });
  if (error) throw error;
}

export async function listShareLinksForResource(
  resourceType: ShareLinkResourceType,
  resourceId: string,
): Promise<ShareLinkRecord[]> {
  const supabase = getAuthenticatedSupabaseClient();
  const { data, error } = await supabase.rpc('list_org_share_links_for_resource', {
    p_resource_type: resourceType,
    p_resource_id: resourceId,
  });
  if (error) throw error;
  if (!Array.isArray(data)) return [];

  return (data as Array<Record<string, unknown>>).map((row) =>
    mapShareLinkRpcRow(row),
  );
}

function mapShareLinkRpcRow(row: Record<string, unknown>): ShareLinkRecord {
  return {
    id: String(row.id),
    token: String(row.token),
    organizationId: String(row.organizationId),
    resourceType: row.resourceType as ShareLinkRecord['resourceType'],
    resourceId: String(row.resourceId),
    accessMode: row.accessMode as ShareLinkRecord['accessMode'],
    channel: row.channel === 'embed' ? 'embed' : 'link',
    settings: (row.settings as ShareLinkSettings | null) ?? {},
    requiresAuth: Boolean(row.requiresAuth),
    expiresAt: (row.expiresAt as string | null | undefined) ?? null,
    revokedAt: (row.revokedAt as string | null | undefined) ?? null,
    createdBy: String(row.createdBy ?? ''),
    createdAt: String(row.createdAt ?? ''),
    updatedAt: String(row.updatedAt ?? ''),
  };
}

function mapShareLinkRow(row: ShareLinkRow): ShareLinkRecord {
  return {
    id: row.id,
    token: row.token,
    organizationId: row.organization_id,
    resourceType: row.resource_type,
    resourceId: row.resource_id,
    accessMode: row.access_mode,
    channel: row.channel === 'embed' ? 'embed' : 'link',
    settings: row.settings ?? {},
    requiresAuth: Boolean(row.requires_auth),
    expiresAt: row.expires_at,
    revokedAt: row.revoked_at,
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
