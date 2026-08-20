import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ALL_CAPABILITIES_TRUE, type OrgMembership } from '@/cloud/types/organization';

const getCloudAuthContext = vi.fn();
const setCloudAuthContext = vi.fn();
const buildCloudAuthContext = vi.fn((input: unknown) => input);
const listMyMemberships = vi.fn();
const pickActiveMembership = vi.fn();
const setStoredActiveOrganizationId = vi.fn();

vi.mock('@/cloud/authContext', () => ({
  getCloudAuthContext: () => getCloudAuthContext(),
  setCloudAuthContext: (...args: any[]) => (setCloudAuthContext as any)(...args),
  buildCloudAuthContext: (...args: any[]) => (buildCloudAuthContext as any)(...args),
}));

vi.mock('@/cloud/repositories/organizationRepository', () => ({
  listMyMemberships: () => listMyMemberships(),
  pickActiveMembership: (...args: any[]) => (pickActiveMembership as any)(...args),
  setStoredActiveOrganizationId: (...args: any[]) => (setStoredActiveOrganizationId as any)(...args),
}));

import { refreshCloudMemberships } from './refreshCloudMemberships';

const membership: OrgMembership = {
  organizationId: 'org-2',
  organizationName: 'Team',
  workspaceType: 'team',
  role: 'admin',
  capabilities: { ...ALL_CAPABILITIES_TRUE },
  status: 'active',
};

describe('refreshCloudMemberships', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    buildCloudAuthContext.mockImplementation((input) => input);
  });

  it('no-ops without auth context', async () => {
    getCloudAuthContext.mockReturnValue(null);
    await refreshCloudMemberships();
    expect(listMyMemberships).not.toHaveBeenCalled();
  });

  it('refreshes memberships and stores active org', async () => {
    const getAccessToken = async () => 'tok';
    getCloudAuthContext.mockReturnValue({
      clerkUserId: 'u',
      userEmail: 'e',
      userDisplayName: 'n',
      getAccessToken,
    });
    listMyMemberships.mockResolvedValue([membership]);
    pickActiveMembership.mockReturnValue(membership);

    await refreshCloudMemberships('org-2');

    expect(pickActiveMembership).toHaveBeenCalledWith([membership], 'org-2');
    expect(setStoredActiveOrganizationId).toHaveBeenCalledWith('org-2');
    expect(setCloudAuthContext).toHaveBeenCalledWith(
      expect.objectContaining({
        memberships: [membership],
        activeMembership: membership,
        workspaceResolved: true,
        getAccessToken,
      }),
    );
  });

  it('skips stored org update when no active membership', async () => {
    getCloudAuthContext.mockReturnValue({
      clerkUserId: 'u',
      userEmail: 'e',
      userDisplayName: 'n',
      getAccessToken: async () => null,
    });
    listMyMemberships.mockResolvedValue([]);
    pickActiveMembership.mockReturnValue(null);

    await refreshCloudMemberships();
    expect(setStoredActiveOrganizationId).not.toHaveBeenCalled();
    expect(setCloudAuthContext).toHaveBeenCalled();
  });
});
