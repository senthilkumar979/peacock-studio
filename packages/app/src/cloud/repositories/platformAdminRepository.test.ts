import { beforeEach, describe, expect, it, vi } from 'vitest';

const invoke = vi.fn();

vi.mock('@/cloud/supabaseClient', () => ({
  getAuthenticatedSupabaseClient: () => ({
    functions: { invoke },
  }),
}));

import {
  fetchPlatformAcquisition,
  fetchPlatformOrganization,
  fetchPlatformOrganizations,
  fetchPlatformOverview,
  fetchPlatformWhoami,
} from './platformAdminRepository';

describe('platformAdminRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetchPlatformWhoami returns false on error', async () => {
    invoke.mockResolvedValue({ data: { isSuperAdmin: true }, error: null });
    await expect(fetchPlatformWhoami()).resolves.toBe(true);

    invoke.mockResolvedValue({ data: null, error: { message: 'nope' } });
    await expect(fetchPlatformWhoami()).resolves.toBe(false);
  });

  it('fetchPlatformOverview normalizes numbers and domains', async () => {
    invoke.mockResolvedValue({
      data: {
        organizationCount: '2',
        userCount: 3,
        documentCount: 4,
        tourCount: 5,
        activeShareLinkCount: 6,
        totalStorageBytes: '7',
        topDomains: [{ domain: 'a.com', count: 2 }, { domain: '', count: 1 }],
      },
      error: null,
    });
    await expect(fetchPlatformOverview()).resolves.toEqual({
      organizationCount: 2,
      userCount: 3,
      documentCount: 4,
      tourCount: 5,
      activeShareLinkCount: 6,
      totalStorageBytes: 7,
      topDomains: [{ domain: 'a.com', count: 2 }],
    });
  });

  it('lists and gets organizations', async () => {
    invoke.mockResolvedValue({ data: { organizations: null }, error: null });
    await expect(fetchPlatformOrganizations()).resolves.toEqual([]);

    invoke.mockResolvedValue({
      data: {
        organizations: [
          {
            id: 'o1',
            name: 'Org',
            workspaceType: 'team',
            plan: 'pro',
            ownerEmail: 'a@b.com',
            memberCount: 1,
            documentCount: 2,
            tourCount: 3,
            storageBytes: 4,
            createdAt: 'c',
          },
        ],
      },
      error: null,
    });
    await expect(fetchPlatformOrganizations()).resolves.toEqual([
      expect.objectContaining({ id: 'o1', workspaceType: 'team' }),
    ]);

    invoke.mockResolvedValue({
      data: {
        id: 'o1',
        name: 'Org',
        workspaceType: 'personal',
        plan: 'free',
        ownerEmail: null,
        website: 'https://x',
        storageBytes: 1,
        assetsStorageBytes: 2,
        createdAt: 'c',
        documentCount: 0,
        tourCount: 0,
        domains: [{ domain: 'x.com', count: 1 }],
        members: [{ email: 'a@b.com', role: 'admin', status: 'active', joinedAt: 'j' }],
      },
      error: null,
    });
    const detail = await fetchPlatformOrganization('o1');
    expect(detail.members[0]?.displayName).toBe('a@b.com');
    expect(detail.website).toBe('https://x');
  });

  it('fetchPlatformAcquisition forwards days', async () => {
    invoke.mockResolvedValue({ data: { days: 14 }, error: null });
    await expect(fetchPlatformAcquisition(14)).resolves.toEqual({ days: 14 });
    expect(invoke).toHaveBeenCalledWith('platform-admin', {
      body: { action: 'acquisition', days: 14 },
    });
  });

  it('surfaces function payload errors', async () => {
    invoke.mockResolvedValue({ data: { error: 'denied' }, error: null });
    await expect(fetchPlatformOverview()).rejects.toThrow(/denied/);

    const context = {
      clone: () => ({
        json: async () => ({ error: 'from-context' }),
      }),
    };
    invoke.mockResolvedValue({
      data: null,
      error: { message: 'fail', context },
    });
    await expect(fetchPlatformOverview()).rejects.toThrow(/from-context/);
  });
});
