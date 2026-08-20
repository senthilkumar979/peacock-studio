import { useSyncExternalStore } from 'react';
import { isPublicShareFeatureEnabled } from '@/analytics/featureFlags';
import {
  getCloudAuthContext,
  hasCapability,
  subscribeCloudAuthContext,
  type CloudAuthContext,
} from '@/cloud/authContext';
import { isCloudSyncFlagEnabled } from '@/cloud/config';
import type { CapabilityKey, MemberCapabilities } from '@/cloud/types/organization';
import { useCloudInitError, useCloudInitErrorDetail } from '@/hooks/useCloudInitError';
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
 *
 * With VITE_CLOUD_SYNC on, unsigned / unresolved sessions disable link + embed (not “coming soon”).
 * Pure local mode (cloud sync off) still allows ID-based share links; embeds always need cloud.
 */
export function useShareMethodAccess(): ShareMethodAccess {
  const mode = useSessionMode();
  const cloudInitError = useCloudInitError();
  const cloudInitErrorDetail = useCloudInitErrorDetail();
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
    const reason = cloudInitErrorDetail?.kind === 'network_blocked'
      ? 'Cloud sharing is unavailable on this network. Try a personal device or ask IT to allowlist Peacock cloud hosts.'
      : cloudInitError
        ? 'Cloud workspace failed to connect. Refresh, or sign out and sign back in.'
        : 'Workspace is still loading…';
    return {
      canShare: false,
      canExport: true,
      canEmbed: false,
      disabledReasons: {
        link: reason,
        embed: reason,
      },
    };
  }

  if (mode === 'guest') {
    return {
      canShare: false,
      canExport: true,
      canEmbed: false,
      disabledReasons: {
        link: 'Sign up or sign in to create share links.',
        embed: 'Sign up or sign in to publish embeds.',
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
  const publicShareEnabled = !isCloudSyncFlagEnabled() || isPublicShareFeatureEnabled();
  const disabledReasons: Partial<Record<ShareMethodKey, string>> = {};
  if (!publicShareEnabled) {
    disabledReasons.link = 'Public sharing is temporarily disabled.';
    disabledReasons.embed = 'Embeds are temporarily disabled.';
  }
  if (!canShareCap) disabledReasons.link = 'Your workspace role cannot share.';
  if (!canExportCap) disabledReasons.pdf = 'Your workspace role cannot export.';
  if (!canEmbedCap) {
    disabledReasons.embed =
      'Your workspace role cannot publish embeds. Ask a workspace admin to enable Embed for your account.';
  }

  return {
    canShare: canShareCap && publicShareEnabled,
    canExport: canExportCap,
    canEmbed: canEmbedCap && publicShareEnabled,
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
