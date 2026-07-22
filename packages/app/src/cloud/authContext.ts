export interface CloudAuthContext {
  clerkUserId: string;
  /** Primary email from Clerk — stable audit key for created_by / updated_by. */
  userEmail: string;
  /** Display name from Clerk — shown in UI as Last updated by. */
  userDisplayName: string;
  organizationId: string;
  getAccessToken: () => Promise<string | null>;
}

let activeContext: CloudAuthContext | null = null;
let cloudInitError: string | null = null;
const listeners = new Set<() => void>();

function notifyListeners(): void {
  listeners.forEach((listener) => listener());
}

export function setCloudAuthContext(context: CloudAuthContext | null): void {
  activeContext = context;
  if (context) {
    cloudInitError = null;
  }
  notifyListeners();
}

export function setCloudInitError(message: string | null): void {
  cloudInitError = message;
  notifyListeners();
}

export function getCloudInitError(): string | null {
  return cloudInitError;
}

export function getCloudAuthContext(): CloudAuthContext | null {
  return activeContext;
}

export function requireCloudAuthContext(): CloudAuthContext {
  const context = activeContext;
  if (!context) {
    throw new Error('Cloud library is not ready. Sign in and wait for sync to initialize.');
  }
  return context;
}

export function isCloudLibraryActive(): boolean {
  return activeContext !== null;
}

export function subscribeCloudAuthContext(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getCloudLibraryActiveSnapshot(): boolean {
  return activeContext !== null;
}

export function getCloudInitErrorSnapshot(): string | null {
  return cloudInitError;
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
