import { useSyncExternalStore } from 'react';
import {
  getCloudAuthContext,
  hasCapability,
  subscribeCloudAuthContext,
  type CloudAuthContext,
} from '@/cloud/authContext';
import type { CapabilityKey, MemberCapabilities } from '@/cloud/types/organization';
import { useCanDeleteLibraryItems, useSessionMode } from '@/hooks/useSessionMode';

export function useCloudAuthContext(): CloudAuthContext | null {
  return useSyncExternalStore(
    subscribeCloudAuthContext,
    getCloudAuthContext,
    () => null,
  );
}

export function useNeedsWorkspaceOnboarding(): boolean {
  const context = useCloudAuthContext();
  return Boolean(context?.needsWorkspaceOnboarding);
}

export function useActiveOrganization() {
  const context = useCloudAuthContext();
  return {
    organizationId: context?.organizationId ?? null,
    organizationName: context?.organizationName ?? null,
    workspaceType: context?.workspaceType ?? null,
    role: context?.role ?? null,
    capabilities: context?.capabilities ?? null,
    memberships: context?.memberships ?? [],
    isAdmin: context?.role === 'admin',
  };
}

export function useHasCapability(capability: CapabilityKey): boolean {
  const context = useCloudAuthContext();
  // Re-subscribe so capability checks update when org switches
  void context;
  return hasCapability(capability);
}

export function useMemberCapabilities(): MemberCapabilities | null {
  return useCloudAuthContext()?.capabilities ?? null;
}

export function useCanDeleteWithCapability(): boolean {
  const sessionAllows = useCanDeleteLibraryItems();
  const mode = useSessionMode();
  const canDelete = useHasCapability('delete');
  if (mode === 'local') return sessionAllows;
  return sessionAllows && canDelete;
}

export function useCanShare(): boolean {
  const mode = useSessionMode();
  const canShare = useHasCapability('share');
  if (mode === 'local') return true;
  if (mode !== 'cloud') return false;
  return canShare;
}

export function useCanExport(): boolean {
  const mode = useSessionMode();
  const canExport = useHasCapability('export');
  if (mode === 'local') return true;
  if (mode !== 'cloud') return false;
  return canExport;
}

export function useCanCreate(): boolean {
  const mode = useSessionMode();
  const canCreate = useHasCapability('create');
  if (mode === 'local') return true;
  if (mode !== 'cloud') return false;
  return canCreate;
}

export function useCanEdit(): boolean {
  const mode = useSessionMode();
  const canEdit = useHasCapability('edit');
  if (mode === 'local') return true;
  if (mode !== 'cloud') return false;
  return canEdit;
}

export function useCanEmbed(): boolean {
  const mode = useSessionMode();
  const canEmbed = useHasCapability('embed');
  if (mode === 'local') return false;
  if (mode !== 'cloud') return false;
  return canEmbed;
}
