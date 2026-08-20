import type {
  MemberCapabilities,
  MemberRole,
  OrgMembership,
} from '@/cloud/types/organization';
import { ALL_CAPABILITIES_TRUE } from '@/cloud/types/organization';
import type { ClassifiedCloudInitError } from '@/cloud/cloudInitErrors';

export interface CloudAuthContext {
  clerkUserId: string;
  /** Primary email from Clerk — stable audit key for created_by / updated_by. */
  userEmail: string;
  /** Display name from Clerk — shown in UI as Last updated by. */
  userDisplayName: string;
  organizationId: string;
  organizationName: string;
  workspaceType: 'personal' | 'team' | null;
  role: MemberRole | null;
  capabilities: MemberCapabilities | null;
  memberships: OrgMembership[];
  /**
   * True only after memberships have been fetched and the list is empty.
   * Never true while still resolving (avoids flashing the workspace chooser on refresh).
   */
  needsWorkspaceOnboarding: boolean;
  /** False until listMyMemberships completes for this signed-in session. */
  workspaceResolved: boolean;
  getAccessToken: () => Promise<string | null>;
}

let activeContext: CloudAuthContext | null = null;
let cloudInitError: string | null = null;
let cloudInitErrorDetail: ClassifiedCloudInitError | null = null;
const listeners = new Set<() => void>();

function notifyListeners(): void {
  listeners.forEach((listener) => listener());
}

export function setCloudAuthContext(context: CloudAuthContext | null): void {
  activeContext = context;
  if (context) {
    cloudInitError = null;
    cloudInitErrorDetail = null;
  }
  notifyListeners();
}

export function setCloudInitError(error: ClassifiedCloudInitError | string | null): void {
  if (error === null) {
    cloudInitError = null;
    cloudInitErrorDetail = null;
  } else if (typeof error === 'string') {
    cloudInitError = error;
    cloudInitErrorDetail = {
      kind: 'unknown',
      title: 'Cloud library unavailable',
      message: error,
      workarounds: [],
    };
  } else {
    cloudInitErrorDetail = error;
    cloudInitError = error.message;
  }
  notifyListeners();
}

export function getCloudInitError(): string | null {
  return cloudInitError;
}

export function getCloudInitErrorDetail(): ClassifiedCloudInitError | null {
  return cloudInitErrorDetail;
}

export function getCloudAuthContext(): CloudAuthContext | null {
  return activeContext;
}

/** Signed-in cloud session (may still need workspace onboarding). */
export function requireCloudAuthSession(): CloudAuthContext {
  const context = activeContext;
  if (!context) {
    throw new Error('Cloud library is not ready. Sign in and wait for sync to initialize.');
  }
  return context;
}

export function requireCloudAuthContext(): CloudAuthContext {
  const context = requireCloudAuthSession();
  if (
    !context.workspaceResolved ||
    context.needsWorkspaceOnboarding ||
    !context.organizationId
  ) {
    throw new Error('Choose or join a workspace before using the cloud library.');
  }
  return context;
}

export function isCloudLibraryActive(): boolean {
  return (
    activeContext !== null &&
    activeContext.workspaceResolved &&
    !activeContext.needsWorkspaceOnboarding &&
    Boolean(activeContext.organizationId)
  );
}

export function subscribeCloudAuthContext(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getCloudLibraryActiveSnapshot(): boolean {
  return isCloudLibraryActive();
}

export function getCloudInitErrorSnapshot(): string | null {
  return cloudInitError;
}

export function getCloudInitErrorDetailSnapshot(): ClassifiedCloudInitError | null {
  return cloudInitErrorDetail;
}

export function hasCapability(capability: keyof MemberCapabilities): boolean {
  const context = activeContext;
  if (!context || !context.workspaceResolved || context.needsWorkspaceOnboarding) return false;
  if (!isCloudLibraryActive()) return false;
  return Boolean(context.capabilities?.[capability]);
}

export function requireCapability(capability: keyof MemberCapabilities): void {
  if (!hasCapability(capability)) {
    throw new Error(`You do not have permission to ${capability} in this workspace.`);
  }
}

/** Prefer Clerk full name; fall back to first+last, then email. */
export function resolveClerkDisplayName(user: {
  fullName?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  primaryEmailAddress?: { emailAddress?: string | null } | null;
} | null | undefined): string | null {
  const fullName = user?.fullName?.trim();
  if (fullName) return fullName;

  const composed = [user?.firstName, user?.lastName]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(' ')
    .trim();
  if (composed) return composed;

  return user?.primaryEmailAddress?.emailAddress?.trim() || null;
}

export function resolveClerkNameParts(user: {
  firstName?: string | null;
  lastName?: string | null;
} | null | undefined): { firstName: string | null; lastName: string | null } {
  const firstName = user?.firstName?.trim() || null;
  const lastName = user?.lastName?.trim() || null;
  return { firstName, lastName };
}

export function buildCloudAuthContext(input: {
  clerkUserId: string;
  userEmail: string;
  userDisplayName: string;
  memberships: OrgMembership[];
  activeMembership: OrgMembership | null;
  workspaceResolved: boolean;
  getAccessToken: () => Promise<string | null>;
}): CloudAuthContext {
  const active = input.activeMembership;
  return {
    clerkUserId: input.clerkUserId,
    userEmail: input.userEmail,
    userDisplayName: input.userDisplayName,
    organizationId: active?.organizationId ?? '',
    organizationName: active?.organizationName ?? '',
    workspaceType: active?.workspaceType ?? null,
    role: active?.role ?? null,
    capabilities: active?.capabilities ?? (active ? ALL_CAPABILITIES_TRUE : null),
    memberships: input.memberships,
    workspaceResolved: input.workspaceResolved,
    needsWorkspaceOnboarding: input.workspaceResolved && input.memberships.length === 0,
    getAccessToken: input.getAccessToken,
  };
}
