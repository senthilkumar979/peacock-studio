import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  setCloudAuthContext,
  setCloudInitError,
  type CloudAuthContext,
} from '@/cloud/authContext';
import {
  useActiveOrganization,
  useCanCreate,
  useCanDeleteWithCapability,
  useCanEdit,
  useCanEmbed,
  useCanExport,
  useCanShare,
  useCloudAuthContext,
  useHasCapability,
  useMemberCapabilities,
  useNeedsWorkspaceOnboarding,
  useShareMethodAccess,
} from './useOrganization';

vi.mock('@/analytics/featureFlags', () => ({
  isPublicShareFeatureEnabled: vi.fn(() => true),
}));

vi.mock('@/cloud/config', () => ({
  isCloudSyncFlagEnabled: vi.fn(() => true),
}));

vi.mock('@/hooks/useCloudInitError', () => ({
  useCloudInitError: vi.fn(() => null),
  useCloudInitErrorDetail: vi.fn(() => null),
}));

vi.mock('@/hooks/useSessionMode', () => ({
  useSessionMode: vi.fn(() => 'guest'),
  useCanDeleteLibraryItems: vi.fn(() => true),
}));

import { isPublicShareFeatureEnabled } from '@/analytics/featureFlags';
import { isCloudSyncFlagEnabled } from '@/cloud/config';
import { useCloudInitError, useCloudInitErrorDetail } from '@/hooks/useCloudInitError';
import { useCanDeleteLibraryItems, useSessionMode } from '@/hooks/useSessionMode';

function makeContext(overrides: Partial<CloudAuthContext> = {}): CloudAuthContext {
  return {
    clerkUserId: 'user_1',
    userEmail: 'a@b.com',
    userDisplayName: 'A',
    organizationId: 'org_1',
    organizationName: 'Org',
    workspaceType: 'personal',
    role: 'admin',
    capabilities: {
      read: true,
      create: true,
      edit: true,
      delete: true,
      share: true,
      export: true,
      embed: true,
    },
    memberships: [],
    needsWorkspaceOnboarding: false,
    workspaceResolved: true,
    getAccessToken: async () => 'token',
    ...overrides,
  };
}

describe('useOrganization hooks', () => {
  beforeEach(() => {
    setCloudAuthContext(null);
    setCloudInitError(null);
    vi.mocked(useSessionMode).mockReturnValue('guest');
    vi.mocked(useCanDeleteLibraryItems).mockReturnValue(true);
    vi.mocked(useCloudInitError).mockReturnValue(null);
    vi.mocked(useCloudInitErrorDetail).mockReturnValue(null);
    vi.mocked(isCloudSyncFlagEnabled).mockReturnValue(true);
    vi.mocked(isPublicShareFeatureEnabled).mockReturnValue(true);
  });

  afterEach(() => {
    setCloudAuthContext(null);
    setCloudInitError(null);
  });

  it('reads auth context and onboarding flag', () => {
    const { result, rerender } = renderHook(() => ({
      ctx: useCloudAuthContext(),
      needs: useNeedsWorkspaceOnboarding(),
      org: useActiveOrganization(),
      caps: useMemberCapabilities(),
    }));
    expect(result.current.ctx).toBeNull();

    act(() => {
      setCloudAuthContext(makeContext({ needsWorkspaceOnboarding: true, role: 'member' }));
    });
    rerender();
    expect(result.current.needs).toBe(true);
    expect(result.current.org.organizationId).toBe('org_1');
    expect(result.current.org.isAdmin).toBe(false);
    expect(result.current.caps?.share).toBe(true);
  });

  it('gates capabilities through hasCapability', () => {
    act(() => {
      setCloudAuthContext(makeContext());
    });
    const { result } = renderHook(() => useHasCapability('share'));
    expect(result.current).toBe(true);
  });

  it('combines session delete permission with capability', () => {
    vi.mocked(useSessionMode).mockReturnValue('local');
    expect(renderHook(() => useCanDeleteWithCapability()).result.current).toBe(true);

    vi.mocked(useSessionMode).mockReturnValue('cloud');
    act(() => {
      setCloudAuthContext(makeContext({ capabilities: { ...makeContext().capabilities!, delete: false } }));
    });
    expect(renderHook(() => useCanDeleteWithCapability()).result.current).toBe(false);
  });

  it('share method access varies by session mode', () => {
    vi.mocked(useSessionMode).mockReturnValue('local');
    expect(renderHook(() => useShareMethodAccess()).result.current).toMatchObject({
      canShare: true,
      canEmbed: false,
    });

    vi.mocked(useSessionMode).mockReturnValue('guest');
    expect(renderHook(() => useCanShare()).result.current).toBe(false);
    expect(renderHook(() => useCanExport()).result.current).toBe(true);

    vi.mocked(useSessionMode).mockReturnValue('loading');
    vi.mocked(useCloudInitError).mockReturnValue('fail');
    expect(renderHook(() => useShareMethodAccess()).result.current.disabledReasons.link).toMatch(
      /failed to connect/i,
    );

    vi.mocked(useCloudInitErrorDetail).mockReturnValue({
      kind: 'network_blocked',
      title: 'Company network may be blocking cloud sync',
      message: 'blocked',
      workarounds: ['Try hotspot'],
    });
    expect(renderHook(() => useShareMethodAccess()).result.current.disabledReasons.link).toMatch(
      /unavailable on this network/i,
    );

    vi.mocked(useCloudInitErrorDetail).mockReturnValue(null);

    vi.mocked(useSessionMode).mockReturnValue('onboarding');
    expect(renderHook(() => useShareMethodAccess()).result.current.canShare).toBe(false);

    vi.mocked(useSessionMode).mockReturnValue('cloud');
    act(() => {
      setCloudAuthContext(makeContext());
    });
    expect(renderHook(() => useCanEmbed()).result.current).toBe(true);
    expect(renderHook(() => useCanCreate()).result.current).toBe(true);
    expect(renderHook(() => useCanEdit()).result.current).toBe(true);

    vi.mocked(isPublicShareFeatureEnabled).mockReturnValue(false);
    expect(renderHook(() => useShareMethodAccess()).result.current.canShare).toBe(false);
  });
});
