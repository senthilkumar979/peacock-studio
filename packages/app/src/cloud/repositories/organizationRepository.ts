import { getAuthenticatedSupabaseClient } from '@/cloud/supabaseClient';
import {
  parseCapabilities,
  type MemberCapabilities,
  type MemberRole,
  type OrgMembership,
  type OrganizationInvitationRecord,
  type OrganizationMemberRecord,
  type PendingInvitation,
} from '@/cloud/types/organization';

const ACTIVE_ORG_STORAGE_KEY = 'peacock.activeOrganizationId';

export function getStoredActiveOrganizationId(): string | null {
  try {
    return localStorage.getItem(ACTIVE_ORG_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setStoredActiveOrganizationId(organizationId: string | null): void {
  try {
    if (!organizationId) {
      localStorage.removeItem(ACTIVE_ORG_STORAGE_KEY);
      return;
    }
    localStorage.setItem(ACTIVE_ORG_STORAGE_KEY, organizationId);
  } catch {
    // ignore storage failures
  }
}

export function pickActiveMembership(
  memberships: OrgMembership[],
  preferredId?: string | null,
): OrgMembership | null {
  if (memberships.length === 0) return null;
  if (preferredId) {
    const preferred = memberships.find((m) => m.organizationId === preferredId);
    if (preferred) return preferred;
  }
  const stored = getStoredActiveOrganizationId();
  if (stored) {
    const fromStorage = memberships.find((m) => m.organizationId === stored);
    if (fromStorage) return fromStorage;
  }
  return memberships[0] ?? null;
}

export async function listMyMemberships(): Promise<OrgMembership[]> {
  const supabase = getAuthenticatedSupabaseClient();
  const { data, error } = await supabase.rpc('list_my_memberships');
  if (error) throw error;
  if (!Array.isArray(data)) return [];

  return data.map((row: Record<string, unknown>) => ({
    organizationId: String(row.organizationId),
    organizationName: String(row.organizationName ?? 'Workspace'),
    workspaceType: row.workspaceType === 'team' ? 'team' : 'personal',
    website: (row.website as string | null | undefined) ?? null,
    role: row.role === 'admin' ? 'admin' : 'member',
    capabilities: parseCapabilities(
      row.capabilities,
      row.role === 'admin' ? 'admin' : 'member',
    ),
    status: row.status === 'disabled' ? 'disabled' : 'active',
    joinedAt: row.joinedAt ? String(row.joinedAt) : undefined,
  }));
}

export async function listMyPendingInvitations(): Promise<PendingInvitation[]> {
  const supabase = getAuthenticatedSupabaseClient();
  const { data, error } = await supabase.rpc('list_my_pending_invitations');
  if (error) throw error;
  if (!Array.isArray(data)) return [];

  return data.map((row: Record<string, unknown>) => ({
    id: String(row.id),
    organizationId: String(row.organizationId),
    organizationName: String(row.organizationName ?? 'Organization'),
    email: String(row.email),
    role: row.role === 'admin' ? 'admin' : 'member',
    capabilities: parseCapabilities(
      row.capabilities,
      row.role === 'admin' ? 'admin' : 'member',
    ),
    token: String(row.token),
    expiresAt: String(row.expiresAt),
    invitedByEmail: (row.invitedByEmail as string | null | undefined) ?? null,
    createdAt: row.createdAt ? String(row.createdAt) : undefined,
  }));
}

export async function createPersonalWorkspace(name?: string | null): Promise<string> {
  const supabase = getAuthenticatedSupabaseClient();
  const { data, error } = await supabase.rpc('create_personal_workspace', {
    p_name: name?.trim() || null,
  });
  if (error) throw error;
  const organizationId = (data as { organizationId?: string } | null)?.organizationId;
  if (!organizationId) throw new Error('Failed to create personal workspace');
  return organizationId;
}

export async function createTeamWorkspace(name: string, website: string): Promise<string> {
  const supabase = getAuthenticatedSupabaseClient();
  const { data, error } = await supabase.rpc('create_team_workspace', {
    p_name: name.trim(),
    p_website: website.trim(),
  });
  if (error) throw error;
  const organizationId = (data as { organizationId?: string } | null)?.organizationId;
  if (!organizationId) throw new Error('Failed to create organization');
  return organizationId;
}

export async function acceptOrganizationInvitation(token: string): Promise<string> {
  const supabase = getAuthenticatedSupabaseClient();
  const { data, error } = await supabase.rpc('accept_organization_invitation', {
    p_token: token,
  });
  if (error) throw error;
  const organizationId = (data as { organizationId?: string } | null)?.organizationId;
  if (!organizationId) throw new Error('Failed to accept invitation');
  return organizationId;
}

export async function createOrganizationInvitation(input: {
  organizationId: string;
  email: string;
  role: MemberRole;
  capabilities?: MemberCapabilities;
}): Promise<{ id: string; token: string; email: string; expiresAt: string }> {
  const supabase = getAuthenticatedSupabaseClient();
  const { data, error } = await supabase.rpc('create_organization_invitation', {
    p_organization_id: input.organizationId,
    p_email: input.email.trim().toLowerCase(),
    p_role: input.role,
    p_capabilities: input.capabilities ?? null,
  });
  if (error) throw error;
  const result = data as {
    id?: string;
    token?: string;
    email?: string;
    expiresAt?: string;
  } | null;
  if (!result?.id || !result.token || !result.email || !result.expiresAt) {
    throw new Error('Failed to create invitation');
  }
  return {
    id: result.id,
    token: result.token,
    email: result.email,
    expiresAt: result.expiresAt,
  };
}

export async function resendOrganizationInvitation(
  invitationId: string,
): Promise<{ id: string; token: string; email: string; expiresAt: string }> {
  const supabase = getAuthenticatedSupabaseClient();
  const { data, error } = await supabase.rpc('resend_organization_invitation', {
    p_invitation_id: invitationId,
  });
  if (error) throw error;
  const result = data as {
    id?: string;
    token?: string;
    email?: string;
    expiresAt?: string;
  } | null;
  if (!result?.id || !result.token || !result.email || !result.expiresAt) {
    throw new Error('Failed to resend invitation');
  }
  return {
    id: result.id,
    token: result.token,
    email: result.email,
    expiresAt: result.expiresAt,
  };
}

export async function revokeOrganizationInvitation(invitationId: string): Promise<void> {
  const supabase = getAuthenticatedSupabaseClient();
  const { error } = await supabase.rpc('revoke_organization_invitation', {
    p_invitation_id: invitationId,
  });
  if (error) throw error;
}

export async function listOrganizationMembers(
  organizationId: string,
): Promise<OrganizationMemberRecord[]> {
  const supabase = getAuthenticatedSupabaseClient();
  const { data, error } = await supabase
    .from('organization_members')
    .select('id, organization_id, clerk_user_id, email, role, capabilities, status, joined_at')
    .eq('organization_id', organizationId)
    .order('joined_at', { ascending: true });

  if (error) throw error;

  return (data ?? []).map((row) => ({
    id: row.id,
    organizationId: row.organization_id,
    clerkUserId: row.clerk_user_id,
    email: row.email,
    role: row.role === 'admin' ? 'admin' : 'member',
    capabilities: parseCapabilities(
      row.capabilities,
      row.role === 'admin' ? 'admin' : 'member',
    ),
    status: row.status === 'disabled' ? 'disabled' : 'active',
    joinedAt: row.joined_at,
  }));
}

export async function listOrganizationInvitations(
  organizationId: string,
): Promise<OrganizationInvitationRecord[]> {
  const supabase = getAuthenticatedSupabaseClient();
  const { data, error } = await supabase
    .from('organization_invitations')
    .select(
      'id, organization_id, email, role, capabilities, token, expires_at, accepted_at, revoked_at, resent_at, invited_by_email, created_at',
    )
    .eq('organization_id', organizationId)
    .is('accepted_at', null)
    .is('revoked_at', null)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data ?? []).map((row) => ({
    id: row.id,
    organizationId: row.organization_id,
    email: row.email,
    role: row.role === 'admin' ? 'admin' : 'member',
    capabilities: parseCapabilities(
      row.capabilities,
      row.role === 'admin' ? 'admin' : 'member',
    ),
    token: row.token,
    expiresAt: row.expires_at,
    acceptedAt: row.accepted_at,
    revokedAt: row.revoked_at,
    resentAt: row.resent_at,
    invitedByEmail: row.invited_by_email,
    createdAt: row.created_at,
  }));
}

export async function updateMemberCapabilities(
  memberId: string,
  capabilities: MemberCapabilities,
): Promise<void> {
  const supabase = getAuthenticatedSupabaseClient();
  const { error } = await supabase.rpc('update_member_capabilities', {
    p_member_id: memberId,
    p_capabilities: capabilities,
  });
  if (error) throw error;
}

export async function setMemberStatus(
  memberId: string,
  status: 'active' | 'disabled',
): Promise<void> {
  const supabase = getAuthenticatedSupabaseClient();
  const { error } = await supabase.rpc('set_member_status', {
    p_member_id: memberId,
    p_status: status,
  });
  if (error) throw error;
}

export interface OrgContributorRow {
  email: string;
  displayName: string;
  count: number;
}

export interface OrgAdminActivity {
  memberCount: number;
  documentCount: number;
  tourCount: number;
  exportCount: number;
  shareCount: number;
  byActor: Array<{ email: string; displayName: string; eventCount: number }>;
  docsByCreator: OrgContributorRow[];
  toursByCreator: OrgContributorRow[];
  exportsByActor: OrgContributorRow[];
  sharesByActor: OrgContributorRow[];
}

export interface OrgDomainUsageRow {
  domain: string;
  count: number;
}

function mapContributorRows(value: unknown): OrgContributorRow[] {
  if (!Array.isArray(value)) return [];
  return (value as Array<Record<string, unknown>>).map((item) => ({
    email: String(item.email ?? ''),
    displayName: String(item.displayName ?? item.email ?? ''),
    count: Number(item.count ?? 0),
  }));
}

export async function fetchOrgAdminActivity(
  organizationId: string,
  days = 30,
): Promise<OrgAdminActivity> {
  const supabase = getAuthenticatedSupabaseClient();
  const { data, error } = await supabase.rpc('get_org_admin_activity', {
    p_organization_id: organizationId,
    p_days: days,
  });
  if (error) throw error;

  const row = (data ?? {}) as Record<string, unknown>;
  return {
    memberCount: Number(row.memberCount ?? 0),
    documentCount: Number(row.documentCount ?? 0),
    tourCount: Number(row.tourCount ?? 0),
    exportCount: Number(row.exportCount ?? 0),
    shareCount: Number(row.shareCount ?? 0),
    byActor: Array.isArray(row.byActor)
      ? (row.byActor as Array<Record<string, unknown>>).map((item) => ({
          email: String(item.email ?? ''),
          displayName: String(item.displayName ?? item.email ?? ''),
          eventCount: Number(item.eventCount ?? 0),
        }))
      : [],
    docsByCreator: mapContributorRows(row.docsByCreator),
    toursByCreator: mapContributorRows(row.toursByCreator),
    exportsByActor: mapContributorRows(row.exportsByActor),
    sharesByActor: mapContributorRows(row.sharesByActor),
  };
}

export async function fetchOrgDomainUsage(
  organizationId: string,
): Promise<OrgDomainUsageRow[]> {
  const supabase = getAuthenticatedSupabaseClient();
  const { data, error } = await supabase.rpc('get_org_domain_usage', {
    p_organization_id: organizationId,
  });
  if (error) throw error;
  if (!Array.isArray(data)) return [];

  return (data as Array<Record<string, unknown>>)
    .map((item) => ({
      domain: String(item.domain ?? ''),
      count: Number(item.count ?? 0),
    }))
    .filter((row) => row.domain && row.count > 0);
}

export class InviteEmailNotConfiguredError extends Error {
  readonly skipped = true as const;

  constructor(message = 'Invite email is not configured') {
    super(message);
    this.name = 'InviteEmailNotConfiguredError';
  }
}

export async function sendOrgInviteEmail(input: {
  toEmail: string;
  organizationName: string;
  inviterName: string;
  inviteToken: string;
  expiresAt: string;
}): Promise<{ sent: true } | { sent: false; skipped: true }> {
  const supabase = getAuthenticatedSupabaseClient();
  const { data, error } = await supabase.functions.invoke('send-org-invite', {
    body: input,
  });

  const payload = data as { skipped?: boolean; error?: string } | null;
  if (payload?.skipped) {
    throw new InviteEmailNotConfiguredError(payload.error ?? 'Invite email is not configured');
  }

  if (error) {
    const context = (error as { context?: Response }).context;
    if (context) {
      try {
        const body = (await context.clone().json()) as { skipped?: boolean; error?: string };
        if (body?.skipped) {
          throw new InviteEmailNotConfiguredError(
            body.error ?? 'Invite email is not configured',
          );
        }
      } catch (parseError) {
        if (parseError instanceof InviteEmailNotConfiguredError) throw parseError;
      }
    }
    throw new Error(error.message || 'Failed to send invite email');
  }

  return { sent: true };
}

export function buildOrgInviteAcceptUrl(token: string): string {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  return `${origin}/accept-invite?token=${encodeURIComponent(token)}`;
}

