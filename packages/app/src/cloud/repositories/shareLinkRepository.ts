import { requireCapability, requireCloudAuthContext } from '@/cloud/authContext';
import { getAuthenticatedSupabaseClient } from '@/cloud/supabaseClient';
import { recordOrgEvent } from '@/cloud/repositories/analyticsRepository';
import type {
  CreateShareLinkInput,
  ShareLinkRecord,
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

  const settings = input.settings ?? {};
  const now = new Date().toISOString();

  if (existing) {
    const { data, error } = await supabase
      .from('share_links')
      .update({
        settings,
        updated_at: now,
        updated_by: userEmail,
      })
      .eq('id', existing.id)
      .select('*')
      .single();

    if (error) throw error;
    return mapShareLinkRow(data as ShareLinkRow);
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
    metadata: { accessMode, channel },
  });

  return mapShareLinkRow(data as ShareLinkRow);
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
    expiresAt: row.expires_at,
    revokedAt: row.revoked_at,
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
