import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { usePlatformAdminData } from './usePlatformAdminData';

vi.mock('@/cloud/repositories/platformAdminRepository', () => ({
  fetchPlatformOverview: vi.fn(),
  fetchPlatformOrganizations: vi.fn(),
  fetchPlatformOrganization: vi.fn(),
}));

vi.mock('@/utils/appError', () => ({
  reportAppError: vi.fn((_c: string, err: unknown) => ({
    title: 'Failed',
    userMessage: err instanceof Error ? err.message : String(err),
  })),
}));

vi.mock('@/utils/notify', () => ({
  notifyError: vi.fn(),
}));

import {
  fetchPlatformOrganization,
  fetchPlatformOrganizations,
  fetchPlatformOverview,
} from '@/cloud/repositories/platformAdminRepository';
import { notifyError } from '@/utils/notify';

describe('usePlatformAdminData', () => {
  beforeEach(() => {
    vi.mocked(fetchPlatformOverview).mockReset();
    vi.mocked(fetchPlatformOrganizations).mockReset();
    vi.mocked(fetchPlatformOrganization).mockReset();
    vi.mocked(notifyError).mockClear();
  });

  it('does nothing when not super admin', () => {
    renderHook(() => usePlatformAdminData(false, 'overview', null));
    expect(fetchPlatformOverview).not.toHaveBeenCalled();
  });

  it('loads overview for super admin', async () => {
    vi.mocked(fetchPlatformOverview).mockResolvedValue({ orgs: 1 } as never);
    const { result } = renderHook(() => usePlatformAdminData(true, 'overview', null));
    await waitFor(() => expect(result.current.loadingOverview).toBe(false));
    expect(result.current.overview).toEqual({ orgs: 1 });
  });

  it('loads organizations tab and selected org detail', async () => {
    vi.mocked(fetchPlatformOverview).mockResolvedValue({} as never);
    vi.mocked(fetchPlatformOrganizations).mockResolvedValue([{ id: 'o1' }] as never);
    vi.mocked(fetchPlatformOrganization).mockResolvedValue({ id: 'o1', name: 'Org' } as never);

    const { result } = renderHook(() => usePlatformAdminData(true, 'organizations', 'o1'));
    await waitFor(() => expect(result.current.organizations).toEqual([{ id: 'o1' }]));
    await waitFor(() => expect(result.current.orgDetail).toEqual({ id: 'o1', name: 'Org' }));
  });

  it('notifies on overview failure', async () => {
    vi.mocked(fetchPlatformOverview).mockRejectedValue(new Error('denied'));
    renderHook(() => usePlatformAdminData(true, 'overview', null));
    await waitFor(() => expect(notifyError).toHaveBeenCalled());
  });
});
