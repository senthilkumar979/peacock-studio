import { getAuthenticatedSupabaseClient } from '@/cloud/supabaseClient';

export interface PlatformDomainRow {
  domain: string;
  count: number;
}

export interface PlatformOverview {
  organizationCount: number;
  userCount: number;
  documentCount: number;
  tourCount: number;
  activeShareLinkCount: number;
  totalStorageBytes: number;
  topDomains: PlatformDomainRow[];
}

export interface PlatformOrganizationSummary {
  id: string;
  name: string;
  workspaceType: 'personal' | 'team';
  plan: string;
  ownerEmail: string | null;
  memberCount: number;
  documentCount: number;
  tourCount: number;
  storageBytes: number;
  createdAt: string;
}

export interface PlatformOrganizationMember {
  email: string;
  displayName: string;
  role: 'admin' | 'member';
  status: 'active' | 'disabled';
  joinedAt: string;
  storageBytes: number;
}

export interface PlatformOrganizationDetail {
  id: string;
  name: string;
  workspaceType: 'personal' | 'team';
  plan: string;
  ownerEmail: string | null;
  website: string | null;
  storageBytes: number;
  assetsStorageBytes: number;
  createdAt: string;
  documentCount: number;
  tourCount: number;
  domains: PlatformDomainRow[];
  members: PlatformOrganizationMember[];
}

type PlatformAction =
  | { action: 'whoami' }
  | { action: 'overview' }
  | { action: 'listOrganizations' }
  | { action: 'getOrganization'; organizationId: string };

async function invokePlatformAdmin<T>(body: PlatformAction): Promise<T> {
  const supabase = getAuthenticatedSupabaseClient();
  const { data, error } = await supabase.functions.invoke('platform-admin', { body });

  if (error) {
    const context = (error as { context?: Response }).context;
    if (context) {
      try {
        const payload = (await context.clone().json()) as { error?: string };
        throw new Error(payload.error || error.message || 'Platform admin request failed');
      } catch (parseError) {
        if (parseError instanceof Error && parseError.message !== error.message) {
          throw parseError;
        }
      }
    }
    throw new Error(error.message || 'Platform admin request failed');
  }

  if (data && typeof data === 'object' && 'error' in data) {
    const payload = data as { error?: string };
    if (payload.error) throw new Error(payload.error);
  }

  return data as T;
}

export async function fetchPlatformWhoami(): Promise<boolean> {
  try {
    const result = await invokePlatformAdmin<{ isSuperAdmin?: boolean }>({ action: 'whoami' });
    return Boolean(result.isSuperAdmin);
  } catch {
    return false;
  }
}

export async function fetchPlatformOverview(): Promise<PlatformOverview> {
  const result = await invokePlatformAdmin<PlatformOverview>({ action: 'overview' });
  return {
    organizationCount: Number(result.organizationCount ?? 0),
    userCount: Number(result.userCount ?? 0),
    documentCount: Number(result.documentCount ?? 0),
    tourCount: Number(result.tourCount ?? 0),
    activeShareLinkCount: Number(result.activeShareLinkCount ?? 0),
    totalStorageBytes: Number(result.totalStorageBytes ?? 0),
    topDomains: mapDomains(result.topDomains),
  };
}

export async function fetchPlatformOrganizations(): Promise<PlatformOrganizationSummary[]> {
  const result = await invokePlatformAdmin<{ organizations?: unknown }>({
    action: 'listOrganizations',
  });
  if (!Array.isArray(result.organizations)) return [];
  return result.organizations.map(mapOrgSummary);
}

export async function fetchPlatformOrganization(
  organizationId: string,
): Promise<PlatformOrganizationDetail> {
  const result = await invokePlatformAdmin<PlatformOrganizationDetail>({
    action: 'getOrganization',
    organizationId,
  });
  return {
    ...mapOrgSummary(result),
    website: result.website ? String(result.website) : null,
    assetsStorageBytes: Number(result.assetsStorageBytes ?? 0),
    domains: mapDomains(result.domains),
    members: Array.isArray(result.members)
      ? result.members.map((member) => ({
          email: String(member.email ?? ''),
          displayName: String(member.displayName ?? member.email ?? ''),
          role: member.role === 'admin' ? 'admin' : 'member',
          status: member.status === 'disabled' ? 'disabled' : 'active',
          joinedAt: String(member.joinedAt ?? ''),
          storageBytes: Number(member.storageBytes ?? 0),
        }))
      : [],
  };
}

function mapOrgSummary(row: unknown): PlatformOrganizationSummary {
  const item = row as Record<string, unknown>;
  return {
    id: String(item.id ?? ''),
    name: String(item.name ?? 'Organization'),
    workspaceType: item.workspaceType === 'team' ? 'team' : 'personal',
    plan: String(item.plan ?? 'free'),
    ownerEmail: item.ownerEmail ? String(item.ownerEmail) : null,
    memberCount: Number(item.memberCount ?? 0),
    documentCount: Number(item.documentCount ?? 0),
    tourCount: Number(item.tourCount ?? 0),
    storageBytes: Number(item.storageBytes ?? 0),
    createdAt: String(item.createdAt ?? ''),
  };
}

function mapDomains(value: unknown): PlatformDomainRow[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((row) => {
      const item = row as Record<string, unknown>;
      return { domain: String(item.domain ?? ''), count: Number(item.count ?? 0) };
    })
    .filter((row) => row.domain && row.count > 0);
}
