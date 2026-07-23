import { useSyncExternalStore } from 'react';
import {
  getCloudAuthContext,
  hasCapability,
  subscribeCloudAuthContext,
  type CloudAuthContext,
} from '@/cloud/authContext';
import type { CapabilityKey, MemberCapabilities } from '@/cloud/types/organization';
import { useCanDeleteLibraryItems, useSessionMode } from '@/hooks/useSessionMode';

type ShareMethodKey = 'embed' | 'pdf' | 'link';

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

export interface ShareMethodAccess {
  canShare: boolean;
  canExport: boolean;
  canEmbed: boolean;
  /** Human-readable reasons when a method is blocked (shown in the picker). */
  disabledReasons: Partial<Record<ShareMethodKey, string>>;
}

/**
 * Share / export / embed availability for the Share UI.
 * PDF export stays available locally even for guests; link + embed need a cloud workspace.
 */
export function useShareMethodAccess(): ShareMethodAccess {
  const mode = useSessionMode();
  const canShareCap = useHasCapability('share');
  const canExportCap = useHasCapability('export');
  const canEmbedCap = useHasCapability('embed');

  if (mode === 'local') {
    return {
      canShare: true,
      canExport: true,
      canEmbed: false,
      disabledReasons: {
        embed: 'Embeds require cloud sync and a signed-in workspace.',
      },
    };
  }

  if (mode === 'loading' || mode === 'connecting') {
    return {
      canShare: false,
      canExport: true,
      canEmbed: false,
      disabledReasons: {
        link: 'Workspace is still loading…',
        embed: 'Workspace is still loading…',
      },
    };
  }

  if (mode === 'guest') {
    return {
      canShare: false,
      canExport: true,
      canEmbed: false,
      disabledReasons: {
        link: 'Sign in to create share links.',
        embed: 'Sign in to publish embeds.',
      },
    };
  }

  if (mode === 'onboarding') {
    return {
      canShare: false,
      canExport: true,
      canEmbed: false,
      disabledReasons: {
        link: 'Choose a workspace to create share links.',
        embed: 'Choose a workspace to publish embeds.',
      },
    };
  }

  // mode === 'cloud'
  const disabledReasons: Partial<Record<ShareMethodKey, string>> = {};
  if (!canShareCap) disabledReasons.link = 'Your workspace role cannot share.';
  if (!canExportCap) disabledReasons.pdf = 'Your workspace role cannot export.';
  if (!canEmbedCap) disabledReasons.embed = 'Your workspace role cannot publish embeds.';

  return {
    canShare: canShareCap,
    canExport: canExportCap,
    canEmbed: canEmbedCap,
    disabledReasons,
  };
}

export function useCanShare(): boolean {
  return useShareMethodAccess().canShare;
}

export function useCanExport(): boolean {
  return useShareMethodAccess().canExport;
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
  return useShareMethodAccess().canEmbed;
}
