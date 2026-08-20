import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useProfileDisplayNames } from './useProfileDisplayNames';

vi.mock('@/cloud/authContext', () => ({
  isCloudLibraryActive: vi.fn(() => false),
}));

vi.mock('@/cloud/repositories/profileRepository', () => ({
  fetchDisplayNamesByEmail: vi.fn(),
}));

import { isCloudLibraryActive } from '@/cloud/authContext';
import { fetchDisplayNamesByEmail } from '@/cloud/repositories/profileRepository';

describe('useProfileDisplayNames', () => {
  beforeEach(() => {
    vi.mocked(isCloudLibraryActive).mockReturnValue(false);
    vi.mocked(fetchDisplayNamesByEmail).mockReset();
  });

  it('returns empty map when cloud library inactive', () => {
    const { result } = renderHook(() => useProfileDisplayNames(['a@b.com']));
    expect(result.current).toEqual({});
    expect(fetchDisplayNamesByEmail).not.toHaveBeenCalled();
  });

  it('fetches unique trimmed emails when cloud active', async () => {
    vi.mocked(isCloudLibraryActive).mockReturnValue(true);
    vi.mocked(fetchDisplayNamesByEmail).mockResolvedValue({ 'a@b.com': 'Ada' });

    const { result } = renderHook(() =>
      useProfileDisplayNames([' A@B.com ', 'a@b.com', null, '']),
    );
    await waitFor(() => {
      expect(result.current).toEqual({ 'a@b.com': 'Ada' });
    });
    expect(fetchDisplayNamesByEmail).toHaveBeenCalledWith(['a@b.com']);
  });

  it('clears names when fetch fails', async () => {
    vi.mocked(isCloudLibraryActive).mockReturnValue(true);
    vi.mocked(fetchDisplayNamesByEmail).mockRejectedValue(new Error('nope'));
    const { result } = renderHook(() => useProfileDisplayNames(['x@y.com']));
    await waitFor(() => expect(result.current).toEqual({}));
  });
});
