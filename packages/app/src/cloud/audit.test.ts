import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ALL_CAPABILITIES_TRUE } from '@/cloud/types/organization';
import { setCloudAuthContext } from './authContext';
import {
  isoToMs,
  msToIso,
  normalizeProfileEmail,
  requireUserEmail,
  stampAuditForCloudWrite,
} from './audit';

describe('audit', () => {
  beforeEach(() => {
    setCloudAuthContext({
      clerkUserId: 'u',
      userEmail: '  User@Example.COM ',
      userDisplayName: 'User',
      organizationId: 'org',
      organizationName: 'Org',
      workspaceType: 'personal',
      role: 'admin',
      capabilities: { ...ALL_CAPABILITIES_TRUE },
      memberships: [],
      needsWorkspaceOnboarding: false,
      workspaceResolved: true,
      getAccessToken: async () => 't',
    });
  });

  it('msToIso and isoToMs convert both directions', () => {
    const ms = Date.parse('2024-01-01T00:00:00.000Z');
    expect(msToIso(ms)).toBe('2024-01-01T00:00:00.000Z');
    expect(isoToMs('2024-01-01T00:00:00.000Z')).toBe(ms);
    expect(isoToMs(1_700_000_000)).toBe(1_700_000_000_000);
    expect(isoToMs(1_700_000_000_000)).toBe(1_700_000_000_000);
  });

  it('isoToMs falls back to now for null/invalid', () => {
    const now = Date.now();
    vi.spyOn(Date, 'now').mockReturnValue(now);
    expect(isoToMs(null)).toBe(now);
    expect(isoToMs('not-a-date')).toBe(now);
  });

  it('normalizeProfileEmail lowercases', () => {
    expect(normalizeProfileEmail('  A@B.Com ')).toBe('a@b.com');
  });

  it('requireUserEmail uses auth context email', () => {
    expect(requireUserEmail()).toBe('user@example.com');
  });

  it('requireUserEmail throws when email missing', () => {
    setCloudAuthContext({
      clerkUserId: 'u',
      userEmail: '   ',
      userDisplayName: 'User',
      organizationId: 'org',
      organizationName: 'Org',
      workspaceType: 'personal',
      role: 'admin',
      capabilities: { ...ALL_CAPABILITIES_TRUE },
      memberships: [],
      needsWorkspaceOnboarding: false,
      workspaceResolved: true,
      getAccessToken: async () => 't',
    });
    expect(() => requireUserEmail()).toThrow(/email is required/);
  });

  it('stampAuditForCloudWrite preserves or refreshes timestamps', () => {
    const stamped = stampAuditForCloudWrite({
      createdAt: 100,
      updatedAt: 200,
      createdBy: ' Old@Mail.COM ',
      updatedBy: 'x',
    });
    expect(stamped.createdAt).toBe(100);
    expect(stamped.createdBy).toBe('old@mail.com');
    expect(stamped.updatedBy).toBe('user@example.com');
    expect(stamped.updatedAt).toBeGreaterThan(200);

    const preserved = stampAuditForCloudWrite(
      { createdAt: 100, updatedAt: 200 },
      { preserveUpdatedAt: true },
    );
    expect(preserved.updatedAt).toBe(200);
    expect(preserved.createdBy).toBe('user@example.com');
  });
});
