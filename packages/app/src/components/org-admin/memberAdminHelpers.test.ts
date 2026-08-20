import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { UserProfile } from '@/cloud/repositories/profileRepository';
import type { OrganizationMemberRecord } from '@/cloud/types/organization';
import { ALL_CAPABILITIES_TRUE } from '@/cloud/types/organization';
import {
  CAPABILITY_LABELS,
  formatInviteCountdown,
  isPlaceholderMemberEmail,
  memberInitials,
  memberInitialsFromIdentity,
  resolveMemberDisplayEmail,
  resolveMemberDisplayName,
  roleLabel,
} from './memberAdminHelpers';

function makeMember(
  overrides: Partial<OrganizationMemberRecord> = {},
): OrganizationMemberRecord {
  return {
    id: 'm1',
    organizationId: 'org1',
    clerkUserId: 'clerk_1',
    email: 'user@example.com',
    role: 'member',
    capabilities: ALL_CAPABILITIES_TRUE,
    status: 'active',
    joinedAt: '2024-01-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('memberAdminHelpers', () => {
  it('exposes capability labels for every key', () => {
    expect(Object.keys(CAPABILITY_LABELS)).toEqual(
      expect.arrayContaining(['read', 'create', 'edit', 'delete', 'share', 'export', 'embed']),
    );
  });

  it('detects placeholder emails', () => {
    expect(isPlaceholderMemberEmail('abc@unknown.local')).toBe(true);
    expect(isPlaceholderMemberEmail('  Jane@Unknown.Local ')).toBe(true);
    expect(isPlaceholderMemberEmail('jane@example.com')).toBe(false);
  });

  it('resolves display email preferring current user then profile', () => {
    const member = makeMember({ email: 'member@unknown.local', clerkUserId: 'clerk_1' });
    const profiles: Record<string, UserProfile> = {
      clerk_1: {
        clerkUserId: 'clerk_1',
        email: 'profile@example.com',
        displayName: 'Profile Name',
        firstName: 'Profile',
        lastName: 'Name',
      },
    };

    expect(
      resolveMemberDisplayEmail(member, profiles, {
        clerkUserId: 'clerk_1',
        email: 'me@example.com',
      }),
    ).toBe('me@example.com');

    expect(resolveMemberDisplayEmail(member, profiles)).toBe('profile@example.com');

    expect(
      resolveMemberDisplayEmail(
        makeMember({ email: 'visible@example.com', clerkUserId: 'clerk_2' }),
        {},
      ),
    ).toBe('visible@example.com');

    expect(
      resolveMemberDisplayEmail(
        makeMember({ email: 'x@unknown.local', clerkUserId: 'clerk_3' }),
        {
          clerk_3: {
            clerkUserId: 'clerk_3',
            email: 'y@unknown.local',
            displayName: 'Fallback Name',
            firstName: null,
            lastName: null,
          },
        },
      ),
    ).toBe('Fallback Name');
  });

  it('resolves display name from current user, name parts, then displayName', () => {
    const member = makeMember({ clerkUserId: 'clerk_1' });

    expect(
      resolveMemberDisplayName(member, {}, {
        clerkUserId: 'clerk_1',
        displayName: 'Current User',
      }),
    ).toBe('Current User');

    expect(
      resolveMemberDisplayName(member, {}, {
        clerkUserId: 'clerk_1',
        displayName: 'email@example.com',
      }),
    ).toBeNull();

    expect(
      resolveMemberDisplayName(member, {
        clerk_1: {
          clerkUserId: 'clerk_1',
          email: 'a@b.com',
          displayName: 'Nick',
          firstName: 'Ada',
          lastName: 'Lovelace',
        },
      }),
    ).toBe('Ada Lovelace');

    expect(
      resolveMemberDisplayName(member, {
        clerk_1: {
          clerkUserId: 'clerk_1',
          email: 'a@b.com',
          displayName: 'Nick Only',
          firstName: null,
          lastName: null,
        },
      }),
    ).toBe('Nick Only');
  });

  it('builds initials from name or email local-part', () => {
    expect(memberInitialsFromIdentity('Ada Lovelace', 'x@y.com')).toBe('AL');
    expect(memberInitialsFromIdentity('Madonna', 'x@y.com')).toBe('MA');
    expect(memberInitialsFromIdentity(null, 'jane.doe@example.com')).toBe('JD');
    expect(memberInitials('single')).toBe('SI');
    expect(memberInitials('first_last@x.com')).toBe('FL');
  });

  it('maps roles to labels', () => {
    expect(roleLabel('admin')).toBe('Admin');
    expect(roleLabel('member')).toBe('Member');
  });

  describe('formatInviteCountdown', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2024-06-01T12:00:00.000Z'));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('returns expired when past', () => {
      expect(formatInviteCountdown('2024-05-01T00:00:00.000Z')).toEqual({
        label: 'Expired',
        urgency: 'expired',
        progress: 0,
      });
    });

    it('labels remaining time and urgency buckets', () => {
      const ok = formatInviteCountdown('2024-06-05T12:00:00.000Z');
      expect(ok.label).toMatch(/d .*h left/);
      expect(ok.urgency).toBe('ok');
      expect(ok.progress).toBeGreaterThan(0);

      const soon = formatInviteCountdown('2024-06-02T18:00:00.000Z');
      expect(soon.urgency).toBe('soon');

      const critical = formatInviteCountdown('2024-06-01T18:00:00.000Z');
      expect(critical.urgency).toBe('critical');
      expect(critical.label).toMatch(/h .*m left|m left/);
    });
  });
});
