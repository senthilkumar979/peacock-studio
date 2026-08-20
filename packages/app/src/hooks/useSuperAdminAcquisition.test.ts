import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useSuperAdminAcquisition } from './useSuperAdminAcquisition';

vi.mock('@/cloud/repositories/platformAdminRepository', () => ({
  fetchPlatformAcquisition: vi.fn(),
}));

import { fetchPlatformAcquisition } from '@/cloud/repositories/platformAdminRepository';

describe('useSuperAdminAcquisition', () => {
  beforeEach(() => {
    vi.mocked(fetchPlatformAcquisition).mockReset();
  });

  it('loads acquisition summary', async () => {
    const payload = { days: 30, totals: { signups: 1 } } as never;
    vi.mocked(fetchPlatformAcquisition).mockResolvedValue(payload);

    const { result } = renderHook(() => useSuperAdminAcquisition(14));
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.summary).toEqual(payload);
    expect(result.current.error).toBeNull();
    expect(fetchPlatformAcquisition).toHaveBeenCalledWith(14);
  });

  it('surfaces fetch errors and supports refresh', async () => {
    vi.mocked(fetchPlatformAcquisition).mockRejectedValueOnce(new Error('denied'));
    const { result } = renderHook(() => useSuperAdminAcquisition());
    await waitFor(() => expect(result.current.error).toBe('denied'));
    expect(result.current.summary).toBeNull();

    vi.mocked(fetchPlatformAcquisition).mockResolvedValue({ ok: true } as never);
    act(() => {
      result.current.refresh();
    });
    await waitFor(() => expect(result.current.summary).toEqual({ ok: true }));
  });
});
