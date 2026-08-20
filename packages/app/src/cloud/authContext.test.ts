import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  ALL_CAPABILITIES_TRUE,
  type OrgMembership,
} from '@/cloud/types/organization';
import {
  buildCloudAuthContext,
  getCloudAuthContext,
  getCloudInitError,
  getCloudInitErrorSnapshot,
  getCloudLibraryActiveSnapshot,
  hasCapability,
  isCloudLibraryActive,
  requireCapability,
  requireCloudAuthContext,
  requireCloudAuthSession,
  resolveClerkDisplayName,
  resolveClerkNameParts,
  setCloudAuthContext,
  setCloudInitError,
  subscribeCloudAuthContext,
} from './authContext';

function membership(partial: Partial<OrgMembership> = {}): OrgMembership {
  return {
    organizationId: 'org-1',
    organizationName: 'Org',
    workspaceType: 'personal',
    role: 'admin',
    capabilities: { ...ALL_CAPABILITIES_TRUE },
    status: 'active',
    ...partial,
  };
}

function context(
  overrides: Partial<Parameters<typeof buildCloudAuthContext>[0]> = {},
) {
  return buildCloudAuthContext({
    clerkUserId: 'user-1',
    userEmail: 'a@b.com',
    userDisplayName: 'A',
    memberships: [membership()],
    activeMembership: membership(),
    workspaceResolved: true,
    getAccessToken: async () => 'tok',
    ...overrides,
  });
}

describe('authContext', () => {
  beforeEach(() => {
    setCloudAuthContext(null);
    setCloudInitError(null);
  });

  it('set/get context clears init error and notifies subscribers', () => {
    const listener = vi.fn();
    const unsub = subscribeCloudAuthContext(listener);
    setCloudInitError('boom');
    expect(getCloudInitError()).toBe('boom');
    setCloudAuthContext(context());
    expect(getCloudAuthContext()?.organizationId).toBe('org-1');
    expect(getCloudInitError()).toBeNull();
    expect(listener).toHaveBeenCalled();
    unsub();
  });

  it('requireCloudAuthSession and requireCloudAuthContext guard states', () => {
    expect(() => requireCloudAuthSession()).toThrow(/not ready/);
    setCloudAuthContext(
      context({
        memberships: [],
        activeMembership: null,
        workspaceResolved: false,
      }),
    );
    expect(() => requireCloudAuthContext()).toThrow(/Choose or join/);

    setCloudAuthContext(
      context({
        memberships: [],
        activeMembership: null,
        workspaceResolved: true,
      }),
    );
    expect(getCloudAuthContext()?.needsWorkspaceOnboarding).toBe(true);
    expect(() => requireCloudAuthContext()).toThrow(/Choose or join/);
  });

  it('isCloudLibraryActive and capability helpers', () => {
    expect(isCloudLibraryActive()).toBe(false);
    expect(getCloudLibraryActiveSnapshot()).toBe(false);
    expect(hasCapability('edit')).toBe(false);

    setCloudAuthContext(context());
    expect(isCloudLibraryActive()).toBe(true);
    expect(hasCapability('edit')).toBe(true);
    expect(() => requireCapability('edit')).not.toThrow();

    setCloudAuthContext(
      context({
        activeMembership: membership({
          capabilities: { ...ALL_CAPABILITIES_TRUE, delete: false },
        }),
      }),
    );
    expect(hasCapability('delete')).toBe(false);
    expect(() => requireCapability('delete')).toThrow(/permission/);
  });

  it('resolveClerkDisplayName and name parts', () => {
    expect(resolveClerkDisplayName(null)).toBeNull();
    expect(resolveClerkDisplayName({ fullName: ' Full ' })).toBe('Full');
    expect(resolveClerkDisplayName({ firstName: 'A', lastName: 'B' })).toBe('A B');
    expect(
      resolveClerkDisplayName({ primaryEmailAddress: { emailAddress: ' x@y.com ' } }),
    ).toBe('x@y.com');
    expect(resolveClerkNameParts({ firstName: ' A ', lastName: '  ' })).toEqual({
      firstName: 'A',
      lastName: null,
    });
  });

  it('buildCloudAuthContext fills defaults and onboarding flag', () => {
    const built = buildCloudAuthContext({
      clerkUserId: 'u',
      userEmail: 'e',
      userDisplayName: 'n',
      memberships: [],
      activeMembership: null,
      workspaceResolved: true,
      getAccessToken: async () => null,
    });
    expect(built.organizationId).toBe('');
    expect(built.capabilities).toBeNull();
    expect(built.needsWorkspaceOnboarding).toBe(true);
    expect(getCloudInitErrorSnapshot()).toBeNull();
  });
});
