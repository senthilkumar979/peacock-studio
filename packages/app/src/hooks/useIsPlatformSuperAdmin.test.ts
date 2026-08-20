import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useIsPlatformSuperAdmin } from './useIsPlatformSuperAdmin';

vi.mock('@/hooks/useSessionMode', () => ({
  useSessionMode: vi.fn(() => 'guest'),
}));

vi.mock('@/cloud/repositories/platformAdminRepository', () => ({
  fetchPlatformWhoami: vi.fn(),
}));

import { fetchPlatformWhoami } from '@/cloud/repositories/platformAdminRepository';
import { useSessionMode } from '@/hooks/useSessionMode';

describe('useIsPlatformSuperAdmin', () => {
  beforeEach(() => {
    vi.mocked(useSessionMode).mockReturnValue('guest');
    vi.mocked(fetchPlatformWhoami).mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('is false and not loading for non-cloud sessions', () => {
    const { result } = renderHook(() => useIsPlatformSuperAdmin());
    expect(result.current).toEqual({ isPlatformSuperAdmin: false, isLoading: false });
    expect(fetchPlatformWhoami).not.toHaveBeenCalled();
  });

  it('loads whoami when session is cloud and returns allowlist result', async () => {
    vi.mocked(useSessionMode).mockReturnValue('cloud');
    vi.mocked(fetchPlatformWhoami).mockResolvedValue(true);

    const { result } = renderHook(() => useIsPlatformSuperAdmin());
    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    expect(result.current.isPlatformSuperAdmin).toBe(true);
  });

  it('clears admin flag when leaving cloud mode', async () => {
    vi.mocked(useSessionMode).mockReturnValue('cloud');
    vi.mocked(fetchPlatformWhoami).mockResolvedValue(true);

    const { result, rerender } = renderHook(() => useIsPlatformSuperAdmin());
    await waitFor(() => {
      expect(result.current.isPlatformSuperAdmin).toBe(true);
    });

    vi.mocked(useSessionMode).mockReturnValue('guest');
    rerender();
    await waitFor(() => {
      expect(result.current).toEqual({ isPlatformSuperAdmin: false, isLoading: false });
    });
  });

  it('ignores late whoami results after unmount', async () => {
    vi.mocked(useSessionMode).mockReturnValue('cloud');
    let resolveWhoami: (value: boolean) => void = () => undefined;
    vi.mocked(fetchPlatformWhoami).mockImplementation(
      () =>
        new Promise<boolean>((resolve) => {
          resolveWhoami = resolve;
        }),
    );

    const { unmount } = renderHook(() => useIsPlatformSuperAdmin());
    unmount();

    await act(async () => {
      resolveWhoami(true);
      await Promise.resolve();
    });
  });
});
