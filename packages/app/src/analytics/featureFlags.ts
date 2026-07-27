import { isCloudSyncFlagEnabled } from '@/cloud/config';

/**
 * PostHog kill-switch flag keys. Defaults are on; turn a flag off in PostHog
 * to disable the feature without a redeploy. `VITE_CLOUD_SYNC` is the master
 * hard-off for all of these cloud-gated features.
 */
export const FeatureFlagKeys = {
  cloudLibrary: 'cloud_library',
  publicShare: 'public_share',
  orgInvites: 'org_invites',
} as const;

export type FeatureFlagKey = (typeof FeatureFlagKeys)[keyof typeof FeatureFlagKeys];

type FeatureFlagReader = (flag: string) => boolean | undefined;

let posthogFlagReader: FeatureFlagReader | null = null;

/** Wired from the PostHog sink after init (consent-gated). */
export function registerPostHogFeatureFlagReader(reader: FeatureFlagReader | null): void {
  posthogFlagReader = reader;
}

/**
 * Kill-switch helper for cloud features.
 *
 * - Master hard-off: when `VITE_CLOUD_SYNC` is falsy, returns `false` so cloud
 *   features no-op. Do not use this to gate guest local IndexedDB paths — local
 *   share/PDF stay available via session mode checks.
 * - When cloud sync is on and PostHog has no answer yet, defaults to enabled
 *   (flags are kill switches, not opt-in gates).
 */
export function isFeatureEnabled(
  flag: FeatureFlagKey | string,
  defaultEnabled = true,
): boolean {
  if (!isCloudSyncFlagEnabled()) return false;

  const fromPostHog = posthogFlagReader?.(flag);
  if (typeof fromPostHog === 'boolean') return fromPostHog;
  return defaultEnabled;
}

export function isCloudLibraryFeatureEnabled(): boolean {
  return isFeatureEnabled(FeatureFlagKeys.cloudLibrary);
}

export function isPublicShareFeatureEnabled(): boolean {
  return isFeatureEnabled(FeatureFlagKeys.publicShare);
}

export function isOrgInvitesFeatureEnabled(): boolean {
  return isFeatureEnabled(FeatureFlagKeys.orgInvites);
}
