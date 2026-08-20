import { beforeEach, describe, expect, it, vi } from 'vitest';

const isCloudSyncFlagEnabled = vi.fn();

vi.mock('@/cloud/config', () => ({
  isCloudSyncFlagEnabled: (...args: any[]) => (isCloudSyncFlagEnabled as any)(...args),
}));

import {
  FeatureFlagKeys,
  isCloudLibraryFeatureEnabled,
  isFeatureEnabled,
  isOrgInvitesFeatureEnabled,
  isPublicShareFeatureEnabled,
  registerPostHogFeatureFlagReader,
} from './featureFlags';

describe('featureFlags', () => {
  beforeEach(() => {
    isCloudSyncFlagEnabled.mockReset();
    registerPostHogFeatureFlagReader(null);
  });

  it('hard-offs all flags when cloud sync is disabled', () => {
    isCloudSyncFlagEnabled.mockReturnValue(false);
    expect(isFeatureEnabled(FeatureFlagKeys.cloudLibrary)).toBe(false);
    expect(isCloudLibraryFeatureEnabled()).toBe(false);
    expect(isPublicShareFeatureEnabled()).toBe(false);
    expect(isOrgInvitesFeatureEnabled()).toBe(false);
  });

  it('defaults to enabled when cloud sync is on and PostHog has no answer', () => {
    isCloudSyncFlagEnabled.mockReturnValue(true);
    expect(isFeatureEnabled(FeatureFlagKeys.publicShare)).toBe(true);
    expect(isFeatureEnabled(FeatureFlagKeys.orgInvites, false)).toBe(false);
  });

  it('defers to the registered PostHog reader', () => {
    isCloudSyncFlagEnabled.mockReturnValue(true);
    registerPostHogFeatureFlagReader((flag) => flag === FeatureFlagKeys.cloudLibrary);

    expect(isCloudLibraryFeatureEnabled()).toBe(true);
    expect(isPublicShareFeatureEnabled()).toBe(false);
  });
});
