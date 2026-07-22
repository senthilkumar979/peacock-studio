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
  embed: false,
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

export function parseCapabilities(value: unknown): MemberCapabilities {
  if (!value || typeof value !== 'object') return { ...DEFAULT_MEMBER_CAPABILITIES };
  const record = value as Record<string, unknown>;
  return {
    create: Boolean(record.create),
    edit: Boolean(record.edit),
    delete: Boolean(record.delete),
    share: Boolean(record.share),
    export: Boolean(record.export),
    embed: Boolean(record.embed),
  };
}
