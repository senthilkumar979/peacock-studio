import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  setCloudAuthContext,
  setCloudInitError,
  type CloudAuthContext,
} from '@/cloud/authContext';
import { setSessionAuthState } from '@/cloud/sessionState';
import {
  useCanDeleteLibraryItems,
  useIsAuthenticatedAppUser,
  useIsGuestSession,
  useSessionMode,
} from './useSessionMode';

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

describe('useSessionMode hooks', () => {
  beforeEach(() => {
    vi.mocked(isCloudSyncEnabled).mockReturnValue(false);
    setCloudAuthContext(null);
    setCloudInitError(null);
    setSessionAuthState(false, false);
  });

  afterEach(() => {
    setCloudAuthContext(null);
    setCloudInitError(null);
    setSessionAuthState(false, false);
  });

  it('returns local when cloud sync is off', () => {
    const { result } = renderHook(() => useSessionMode());
    expect(result.current).toBe('local');
  });

  it('tracks loading / guest / cloud modes when sync is on', () => {
    vi.mocked(isCloudSyncEnabled).mockReturnValue(true);
    const { result } = renderHook(() => useSessionMode());
    expect(result.current).toBe('loading');

    act(() => {
      setSessionAuthState(true, false);
    });
    expect(result.current).toBe('guest');

    act(() => {
      setSessionAuthState(true, true);
      setCloudAuthContext(makeContext());
    });
    expect(result.current).toBe('cloud');
  });

  it('useIsGuestSession mirrors guest mode', () => {
    vi.mocked(isCloudSyncEnabled).mockReturnValue(true);
    act(() => {
      setSessionAuthState(true, false);
    });
    const { result } = renderHook(() => useIsGuestSession());
    expect(result.current).toBe(true);
  });

  it('useIsAuthenticatedAppUser is true when sync is off', () => {
    const { result } = renderHook(() => useIsAuthenticatedAppUser());
    expect(result.current).toBe(true);
  });

  it('useIsAuthenticatedAppUser requires cloud-ish modes when sync is on', () => {
    vi.mocked(isCloudSyncEnabled).mockReturnValue(true);
    act(() => {
      setSessionAuthState(true, false);
    });
    const { result, rerender } = renderHook(() => useIsAuthenticatedAppUser());
    expect(result.current).toBe(false);

    act(() => {
      setSessionAuthState(true, true);
      setCloudAuthContext(makeContext());
    });
    rerender();
    expect(result.current).toBe(true);
  });

  it('useCanDeleteLibraryItems allows local and cloud with delete capability', () => {
    const { result: local } = renderHook(() => useCanDeleteLibraryItems());
    expect(local.current).toBe(true);

    vi.mocked(isCloudSyncEnabled).mockReturnValue(true);
    act(() => {
      setSessionAuthState(true, false);
    });
    const { result: guest } = renderHook(() => useCanDeleteLibraryItems());
    expect(guest.current).toBe(false);

    act(() => {
      setSessionAuthState(true, true);
      setCloudAuthContext(makeContext());
    });
    const { result: cloud } = renderHook(() => useCanDeleteLibraryItems());
    expect(cloud.current).toBe(true);

    act(() => {
      setCloudAuthContext(
        makeContext({
          capabilities: {
            read: true,
            create: true,
            edit: true,
            delete: false,
            share: false,
            export: false,
            embed: false,
          },
        }),
      );
    });
    const { result: noDelete } = renderHook(() => useCanDeleteLibraryItems());
    expect(noDelete.current).toBe(false);
  });
});
