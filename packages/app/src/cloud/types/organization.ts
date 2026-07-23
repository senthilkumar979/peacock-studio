export type WorkspaceType = 'personal' | 'team';
export type MemberRole = 'admin' | 'member';
export type MemberStatus = 'active' | 'disabled';

export interface MemberCapabilities {
  create: boolean;
  edit: boolean;
  delete: boolean;
  share: boolean;
  export: boolean;
  embed: boolean;
}

export interface OrgMembership {
  organizationId: string;
  organizationName: string;
  workspaceType: WorkspaceType;
  website?: string | null;
  role: MemberRole;
  capabilities: MemberCapabilities;
  status: MemberStatus;
  joinedAt?: string;
}

export interface PendingInvitation {
  id: string;
  organizationId: string;
  organizationName: string;
  email: string;
  role: MemberRole;
  capabilities: MemberCapabilities;
  token: string;
  expiresAt: string;
  invitedByEmail?: string | null;
  createdAt?: string;
}

export interface OrganizationInvitationRecord {
  id: string;
  organizationId: string;
  email: string;
  role: MemberRole;
  capabilities: MemberCapabilities;
  token: string;
  expiresAt: string;
  acceptedAt?: string | null;
  revokedAt?: string | null;
  resentAt?: string | null;
  invitedByEmail?: string | null;
  createdAt: string;
}

export interface OrganizationMemberRecord {
  id: string;
  organizationId: string;
  clerkUserId: string;
  email: string;
  role: MemberRole;
  capabilities: MemberCapabilities;
  status: MemberStatus;
  joinedAt: string;
}

export const ALL_CAPABILITIES_TRUE: MemberCapabilities = {
  create: true,
  edit: true,
  delete: true,
  share: true,
  export: true,
  embed: true,
};

export const DEFAULT_MEMBER_CAPABILITIES: MemberCapabilities = {
  create: true,
  edit: true,
  delete: false,
  share: true,
  export: true,
  embed: true,
};

export const CAPABILITY_KEYS = [
  'create',
  'edit',
  'delete',
  'share',
  'export',
  'embed',
] as const;

export type CapabilityKey = (typeof CAPABILITY_KEYS)[number];

export function parseCapabilities(
  value: unknown,
  role: MemberRole = 'member',
): MemberCapabilities {
  const defaults = role === 'admin' ? ALL_CAPABILITIES_TRUE : DEFAULT_MEMBER_CAPABILITIES;
  if (!value || typeof value !== 'object') return { ...defaults };
  const record = value as Record<string, unknown>;
  return {
    create: typeof record.create === 'boolean' ? record.create : defaults.create,
    edit: typeof record.edit === 'boolean' ? record.edit : defaults.edit,
    delete: typeof record.delete === 'boolean' ? record.delete : defaults.delete,
    share: typeof record.share === 'boolean' ? record.share : defaults.share,
    export: typeof record.export === 'boolean' ? record.export : defaults.export,
    embed: typeof record.embed === 'boolean' ? record.embed : defaults.embed,
  };
}
