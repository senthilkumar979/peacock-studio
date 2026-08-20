import { beforeEach, describe, expect, it, vi } from 'vitest';

const fromMock = vi.fn();
const rpcMock = vi.fn();
const invoke = vi.fn();
const getTurnstileToken = vi.fn(async () => 'turnstile');

vi.mock('@/cloud/supabaseClient', () => ({
  getAuthenticatedSupabaseClient: () => ({
    from: fromMock,
    rpc: rpcMock,
    functions: { invoke },
  }),
}));

vi.mock('@/security/turnstile', () => ({
  getTurnstileToken: (...args: any[]) => (getTurnstileToken as any)(...args),
}));

import {
  InviteEmailNotConfiguredError,
  InviteEmailSendError,
  acceptOrganizationInvitation,
  buildOrgInviteAcceptUrl,
  createOrganizationGroup,
  createOrganizationInvitation,
  createPersonalWorkspace,
  createTeamWorkspace,
  deleteOrganizationGroup,
  fetchOrgAdminActivity,
  fetchOrgDomainUsage,
  getStoredActiveOrganizationId,
  listMyMemberships,
  listMyPendingInvitations,
  listOrganizationGroups,
  listOrganizationInvitations,
  listOrganizationMembers,
  pickActiveMembership,
  removeOrganizationMember,
  resendOrganizationInvitation,
  revokeOrganizationInvitation,
  sendOrgInviteEmail,
  setMemberStatus,
  setOrganizationGroupMembers,
  setStoredActiveOrganizationId,
  syncMyMembershipEmails,
  updateMemberCapabilities,
  updateOrganizationGroup,
} from './organizationRepository';
import { ALL_CAPABILITIES_TRUE } from '@/cloud/types/organization';

function chain(result: { data?: unknown; error?: unknown }) {
  const api: Record<string, unknown> = {};
  for (const method of [
    'select',
    'eq',
    'order',
    'is',
    'in',
    'insert',
    'update',
    'delete',
    'single',
  ] as const) {
    api[method] = vi.fn(() => api);
  }
  (api as { then?: unknown }).then = (onFulfilled: (value: unknown) => unknown) =>
    Promise.resolve(result).then(onFulfilled);
  return api;
}

describe('organizationRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('stores and picks active membership', () => {
    expect(getStoredActiveOrganizationId()).toBeNull();
    setStoredActiveOrganizationId('org-2');
    expect(getStoredActiveOrganizationId()).toBe('org-2');
    setStoredActiveOrganizationId(null);
    expect(getStoredActiveOrganizationId()).toBeNull();

    const memberships = [
      {
        organizationId: 'org-1',
        organizationName: 'A',
        workspaceType: 'personal' as const,
        role: 'admin' as const,
        capabilities: { ...ALL_CAPABILITIES_TRUE },
        status: 'active' as const,
      },
      {
        organizationId: 'org-2',
        organizationName: 'B',
        workspaceType: 'team' as const,
        role: 'member' as const,
        capabilities: { ...ALL_CAPABILITIES_TRUE },
        status: 'active' as const,
      },
    ];
    expect(pickActiveMembership([], 'org-1')).toBeNull();
    expect(pickActiveMembership(memberships, 'org-2')?.organizationId).toBe('org-2');
    setStoredActiveOrganizationId('org-1');
    expect(pickActiveMembership(memberships)?.organizationId).toBe('org-1');
  });

  it('lists memberships and invitations via rpc', async () => {
    rpcMock.mockResolvedValueOnce({
      data: [
        {
          organizationId: 'org-1',
          organizationName: 'Org',
          workspaceType: 'team',
          role: 'admin',
          capabilities: { delete: false },
          status: 'active',
          joinedAt: 'j',
        },
      ],
      error: null,
    });
    const memberships = await listMyMemberships();
    expect(memberships[0]).toMatchObject({ organizationId: 'org-1', workspaceType: 'team' });

    rpcMock.mockResolvedValueOnce({ data: 'not-array', error: null });
    await expect(listMyMemberships()).resolves.toEqual([]);

    rpcMock.mockResolvedValueOnce({
      data: [
        {
          id: 'inv1',
          organizationId: 'org-1',
          organizationName: 'Org',
          email: 'a@b.com',
          role: 'member',
          capabilities: {},
          token: 't',
          expiresAt: 'e',
        },
      ],
      error: null,
    });
    await expect(listMyPendingInvitations()).resolves.toHaveLength(1);
  });

  it('creates workspaces and accepts invitations', async () => {
    rpcMock.mockResolvedValueOnce({ data: { organizationId: 'o1' }, error: null });
    await expect(createPersonalWorkspace('  Name  ')).resolves.toBe('o1');

    rpcMock.mockResolvedValueOnce({ data: {}, error: null });
    await expect(createPersonalWorkspace()).rejects.toThrow(/personal workspace/);

    rpcMock.mockResolvedValueOnce({ data: { organizationId: 'o2' }, error: null });
    await expect(createTeamWorkspace('Team', 'https://x')).resolves.toBe('o2');

    rpcMock.mockResolvedValueOnce({ data: { organizationId: 'o3' }, error: null });
    await expect(acceptOrganizationInvitation('tok')).resolves.toBe('o3');
  });

  it('creates/resends invitations and lists members/invites', async () => {
    rpcMock.mockResolvedValueOnce({
      data: { id: 'i1', token: 't', email: 'a@b.com', expiresAt: 'e' },
      error: null,
    });
    await expect(
      createOrganizationInvitation({
        organizationId: 'o',
        email: ' A@B.com ',
        role: 'member',
      }),
    ).resolves.toEqual({ id: 'i1', token: 't', email: 'a@b.com', expiresAt: 'e' });

    rpcMock.mockResolvedValueOnce({
      data: JSON.stringify({
        invitationId: 'i2',
        token: 't2',
        email: 'c@d.com',
        expiresAt: 'e2',
      }),
      error: null,
    });
    await expect(resendOrganizationInvitation('i2')).resolves.toMatchObject({ id: 'i2' });

    rpcMock.mockResolvedValueOnce({ data: null, error: null });
    await revokeOrganizationInvitation('i2');

    fromMock.mockReturnValue(
      chain({
        data: [
          {
            id: 'm1',
            organization_id: 'o',
            clerk_user_id: 'u',
            email: 'a@b.com',
            role: 'admin',
            capabilities: {},
            status: 'active',
            joined_at: 'j',
          },
        ],
        error: null,
      }),
    );
    await expect(listOrganizationMembers('o')).resolves.toHaveLength(1);

    fromMock.mockReturnValue(
      chain({
        data: [
          {
            id: 'inv',
            organization_id: 'o',
            email: 'a@b.com',
            role: 'member',
            capabilities: {},
            token: 't',
            expires_at: 'e',
            accepted_at: null,
            revoked_at: null,
            resent_at: null,
            invited_by_email: null,
            created_at: 'c',
          },
        ],
        error: null,
      }),
    );
    await expect(listOrganizationInvitations('o')).resolves.toHaveLength(1);
  });

  it('member mutation rpcs and admin activity', async () => {
    rpcMock.mockResolvedValue({ data: null, error: null });
    await updateMemberCapabilities('m1', { ...ALL_CAPABILITIES_TRUE });
    await setMemberStatus('m1', 'disabled');
    await removeOrganizationMember('m1');
    await syncMyMembershipEmails();

    rpcMock.mockResolvedValueOnce({
      data: {
        memberCount: 1,
        documentCount: 2,
        tourCount: 3,
        exportCount: 4,
        shareCount: 5,
        byActor: [{ email: 'a', displayName: 'A', eventCount: 1 }],
        docsByCreator: [{ email: 'a', count: 1 }],
      },
      error: null,
    });
    const activity = await fetchOrgAdminActivity('o');
    expect(activity.documentCount).toBe(2);
    expect(activity.docsByCreator[0]?.email).toBe('a');

    rpcMock.mockResolvedValueOnce({
      data: [{ domain: 'x.com', count: 2 }, { domain: '', count: 1 }],
      error: null,
    });
    await expect(fetchOrgDomainUsage('o')).resolves.toEqual([{ domain: 'x.com', count: 2 }]);
  });

  it('sendOrgInviteEmail handles skip/error/success', async () => {
    await expect(sendOrgInviteEmail({ invitationId: ' ', inviterName: 'X' })).rejects.toBeInstanceOf(
      InviteEmailSendError,
    );

    invoke.mockResolvedValueOnce({ data: { skipped: true, error: 'no mail' }, error: null });
    await expect(
      sendOrgInviteEmail({ invitationId: 'i1', inviterName: 'X' }),
    ).rejects.toBeInstanceOf(InviteEmailNotConfiguredError);

    invoke.mockResolvedValueOnce({ data: { error: 'boom', detail: 'd' }, error: null });
    await expect(
      sendOrgInviteEmail({ invitationId: 'i1', inviterName: 'X' }),
    ).rejects.toBeInstanceOf(InviteEmailSendError);

    invoke.mockResolvedValueOnce({ data: {}, error: null });
    await expect(sendOrgInviteEmail({ invitationId: 'i1', inviterName: 'X' })).resolves.toEqual({
      sent: true,
    });

    expect(buildOrgInviteAcceptUrl('tok space')).toContain('/accept-invite?token=tok%20space');
  });

  it('organization groups CRUD and memberships', async () => {
    fromMock
      .mockReturnValueOnce(
        chain({
          data: [
            {
              id: 'g1',
              organization_id: 'o',
              name: 'G',
              description: 'd',
              capabilities: {},
              created_at: 'c',
              updated_at: 'u',
            },
          ],
          error: null,
        }),
      )
      .mockReturnValueOnce(
        chain({
          data: [{ group_id: 'g1', member_id: 'm1' }],
          error: null,
        }),
      );
    const groups = await listOrganizationGroups('o');
    expect(groups[0]?.memberIds).toEqual(['m1']);

    fromMock.mockReturnValueOnce(chain({ data: [], error: null }));
    await expect(listOrganizationGroups('o')).resolves.toEqual([]);

    fromMock.mockReturnValueOnce(
      chain({
        data: {
          id: 'g2',
          organization_id: 'o',
          name: 'New',
          description: '',
          capabilities: {},
          created_at: 'c',
          updated_at: 'u',
        },
        error: null,
      }),
    );
    await createOrganizationGroup({
      organizationId: 'o',
      name: ' New ',
      capabilities: { ...ALL_CAPABILITIES_TRUE },
    });

    fromMock.mockReturnValue(chain({ data: null, error: null }));
    await updateOrganizationGroup({
      groupId: 'g1',
      name: 'N',
      capabilities: { ...ALL_CAPABILITIES_TRUE },
    });
    await deleteOrganizationGroup('g1');

    fromMock
      .mockReturnValueOnce(
        chain({
          data: [
            { id: 'row1', member_id: 'm1' },
            { id: 'row2', member_id: 'm2' },
          ],
          error: null,
        }),
      )
      .mockReturnValueOnce(chain({ data: null, error: null }))
      .mockReturnValueOnce(chain({ data: null, error: null }));
    await setOrganizationGroupMembers('g1', ['m2', 'm3', 'm3']);
  });
});
