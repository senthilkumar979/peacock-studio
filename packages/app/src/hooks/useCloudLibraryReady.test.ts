import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  setCloudAuthContext,
  setCloudInitError,
  type CloudAuthContext,
} from '@/cloud/authContext';
import { useCloudLibraryReady } from './useCloudLibraryReady';

vi.mock('@/cloud/config', () => ({
  isCloudSyncEnabled: vi.fn(() => false),
}));

import { isCloudSyncEnabled } from '@/cloud/config';

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

describe('useCloudLibraryReady', () => {
  beforeEach(() => {
    vi.mocked(isCloudSyncEnabled).mockReturnValue(false);
    setCloudAuthContext(null);
    setCloudInitError(null);
  });

  afterEach(() => {
    setCloudAuthContext(null);
    setCloudInitError(null);
  });

  it('is ready immediately when cloud sync is disabled', () => {
    const { result } = renderHook(() => useCloudLibraryReady());
    expect(result.current).toEqual({
      isCloudMode: false,
      isReady: true,
      initError: null,
    });
  });

  it('is not ready in cloud mode until auth context is active', () => {
    vi.mocked(isCloudSyncEnabled).mockReturnValue(true);
    const { result } = renderHook(() => useCloudLibraryReady());
    expect(result.current.isCloudMode).toBe(true);
    expect(result.current.isReady).toBe(false);

    act(() => {
      setCloudAuthContext(makeContext());
    });
    expect(result.current.isReady).toBe(true);
  });

  it('exposes initError from auth context', () => {
    vi.mocked(isCloudSyncEnabled).mockReturnValue(true);
    const { result } = renderHook(() => useCloudLibraryReady());

    act(() => {
      setCloudInitError('Missing org');
    });
    expect(result.current.initError).toBe('Missing org');
  });
});
