import { getAuthenticatedSupabaseClient } from '@/cloud/supabaseClient';
import { getTurnstileToken } from '@/security/turnstile';
import {
  parseCapabilities,
  type MemberCapabilities,
  type MemberRole,
  type OrgMembership,
  type OrganizationGroupRecord,
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
  const result = (typeof data === 'string' ? JSON.parse(data) : data) as {
    id?: string;
    invitationId?: string;
    token?: string;
    email?: string;
    expiresAt?: string;
  } | null;
  const id = result?.id ?? result?.invitationId;
  if (!id || !result?.token || !result?.email || !result?.expiresAt) {
    throw new Error('Failed to create invitation');
  }
  return {
    id,
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
  const result = (typeof data === 'string' ? JSON.parse(data) : data) as {
    id?: string;
    invitationId?: string;
    token?: string;
    email?: string;
    expiresAt?: string;
  } | null;
  const id = result?.id ?? result?.invitationId;
  if (!id || !result?.token || !result?.email || !result?.expiresAt) {
    throw new Error('Failed to resend invitation');
  }
  return {
    id,
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

export async function removeOrganizationMember(memberId: string): Promise<void> {
  const supabase = getAuthenticatedSupabaseClient();
  const { error } = await supabase.rpc('remove_organization_member', {
    p_member_id: memberId,
  });
  if (error) throw error;
}

/** Repair placeholder emails on the caller's membership rows from JWT/profile. */
export async function syncMyMembershipEmails(): Promise<void> {
  const supabase = getAuthenticatedSupabaseClient();
  const { error } = await supabase.rpc('sync_my_membership_emails');
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

export class InviteEmailSendError extends Error {
  readonly detail?: string;

  constructor(message: string, detail?: string) {
    super(message);
    this.name = 'InviteEmailSendError';
    this.detail = detail;
  }
}

export async function sendOrgInviteEmail(input: {
  invitationId: string;
  inviterName: string;
}): Promise<{ sent: true } | { sent: false; skipped: true }> {
  const invitationId = input.invitationId?.trim();
  if (!invitationId) {
    throw new InviteEmailSendError(
      'Missing invitation id. Refresh the page and try inviting again.',
    );
  }

  const turnstileToken = await getTurnstileToken('send-org-invite');
  const supabase = getAuthenticatedSupabaseClient();
  const { data, error } = await supabase.functions.invoke('send-org-invite', {
    body: {
      invitationId,
      inviterName: input.inviterName,
      turnstileToken,
    },
  });

  const payload = data as { skipped?: boolean; error?: string; detail?: string } | null;
  if (payload?.skipped) {
    throw new InviteEmailNotConfiguredError(payload.error ?? 'Invite email is not configured');
  }

  if (error) {
    const context = (error as { context?: Response }).context;
    if (context) {
      try {
        const body = (await context.clone().json()) as {
          skipped?: boolean;
          error?: string;
          detail?: string;
        };
        if (body?.skipped) {
          throw new InviteEmailNotConfiguredError(
            body.error ?? 'Invite email is not configured',
          );
        }
        if (body?.error || body?.detail) {
          throw new InviteEmailSendError(
            body.detail || body.error || 'Failed to send invite email',
            body.detail,
          );
        }
      } catch (parseError) {
        if (
          parseError instanceof InviteEmailNotConfiguredError ||
          parseError instanceof InviteEmailSendError
        ) {
          throw parseError;
        }
      }
    }
    throw new InviteEmailSendError(error.message || 'Failed to send invite email');
  }

  if (payload?.error) {
    throw new InviteEmailSendError(payload.detail || payload.error, payload.detail);
  }

  return { sent: true };
}

export function buildOrgInviteAcceptUrl(token: string): string {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  return `${origin}/accept-invite?token=${encodeURIComponent(token)}`;
}

export async function listOrganizationGroups(
  organizationId: string,
): Promise<OrganizationGroupRecord[]> {
  const supabase = getAuthenticatedSupabaseClient();
  const { data: groups, error } = await supabase
    .from('organization_groups')
    .select('id, organization_id, name, description, capabilities, created_at, updated_at')
    .eq('organization_id', organizationId)
    .order('name', { ascending: true });

  if (error) throw error;
  if (!groups?.length) return [];

  const groupIds = groups.map((group) => group.id);
  const { data: memberships, error: memberError } = await supabase
    .from('organization_group_members')
    .select('group_id, member_id')
    .in('group_id', groupIds);

  if (memberError) throw memberError;

  const memberIdsByGroup = new Map<string, string[]>();
  for (const row of memberships ?? []) {
    const list = memberIdsByGroup.get(row.group_id) ?? [];
    list.push(row.member_id);
    memberIdsByGroup.set(row.group_id, list);
  }

  return groups.map((group) => ({
    id: group.id,
    organizationId: group.organization_id,
    name: group.name,
    description: group.description ?? '',
    capabilities: parseCapabilities(group.capabilities, 'member'),
    createdAt: group.created_at,
    updatedAt: group.updated_at,
    memberIds: memberIdsByGroup.get(group.id) ?? [],
  }));
}

export async function createOrganizationGroup(input: {
  organizationId: string;
  name: string;
  description?: string;
  capabilities: MemberCapabilities;
}): Promise<OrganizationGroupRecord> {
  const supabase = getAuthenticatedSupabaseClient();
  const { data, error } = await supabase
    .from('organization_groups')
    .insert({
      organization_id: input.organizationId,
      name: input.name.trim(),
      description: input.description?.trim() ?? '',
      capabilities: input.capabilities,
    })
    .select('id, organization_id, name, description, capabilities, created_at, updated_at')
    .single();

  if (error) throw error;

  return {
    id: data.id,
    organizationId: data.organization_id,
    name: data.name,
    description: data.description ?? '',
    capabilities: parseCapabilities(data.capabilities, 'member'),
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    memberIds: [],
  };
}

export async function updateOrganizationGroup(input: {
  groupId: string;
  name: string;
  description?: string;
  capabilities: MemberCapabilities;
}): Promise<void> {
  const supabase = getAuthenticatedSupabaseClient();
  const { error } = await supabase
    .from('organization_groups')
    .update({
      name: input.name.trim(),
      description: input.description?.trim() ?? '',
      capabilities: input.capabilities,
      updated_at: new Date().toISOString(),
    })
    .eq('id', input.groupId);

  if (error) throw error;
}

export async function deleteOrganizationGroup(groupId: string): Promise<void> {
  const supabase = getAuthenticatedSupabaseClient();
  const { error } = await supabase.from('organization_groups').delete().eq('id', groupId);
  if (error) throw error;
}

export async function setOrganizationGroupMembers(
  groupId: string,
  memberIds: string[],
): Promise<void> {
  const supabase = getAuthenticatedSupabaseClient();
  const uniqueIds = [...new Set(memberIds)];

  const { data: existing, error: existingError } = await supabase
    .from('organization_group_members')
    .select('id, member_id')
    .eq('group_id', groupId);

  if (existingError) throw existingError;

  const existingIds = new Set((existing ?? []).map((row) => row.member_id as string));
  const nextIds = new Set(uniqueIds);
  const toRemove = (existing ?? [])
    .filter((row) => !nextIds.has(row.member_id))
    .map((row) => row.id);
  const toAdd = uniqueIds.filter((id) => !existingIds.has(id));

  if (toRemove.length > 0) {
    const { error } = await supabase
      .from('organization_group_members')
      .delete()
      .in('id', toRemove);
    if (error) throw error;
  }

  if (toAdd.length > 0) {
    const { error } = await supabase.from('organization_group_members').insert(
      toAdd.map((memberId) => ({
        group_id: groupId,
        member_id: memberId,
      })),
    );
    if (error) throw error;
  }
}


