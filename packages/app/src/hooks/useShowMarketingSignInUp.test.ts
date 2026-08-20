import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { setSessionAuthState } from '@/cloud/sessionState';
import { useShowMarketingSignInUp } from './useShowMarketingSignInUp';

vi.mock('@/cloud/config', () => ({
  isCloudSyncEnabled: vi.fn(() => true),
}));

import { isCloudSyncEnabled } from '@/cloud/config';

describe('useShowMarketingSignInUp', () => {
  beforeEach(() => {
    vi.mocked(isCloudSyncEnabled).mockReturnValue(true);
    setSessionAuthState(false, false);
  });

  afterEach(() => {
    setSessionAuthState(false, false);
  });

  it('hides Sign in / Sign up while auth is loading', () => {
    const { result } = renderHook(() => useShowMarketingSignInUp());
    expect(result.current).toBe(false);
  });

  it('shows Sign in / Sign up for a signed-out guest', () => {
    const { result } = renderHook(() => useShowMarketingSignInUp());
    act(() => {
      setSessionAuthState(true, false);
    });
    expect(result.current).toBe(true);
  });

  it('hides Sign in / Sign up when the user is signed in', () => {
    const { result } = renderHook(() => useShowMarketingSignInUp());
    act(() => {
      setSessionAuthState(true, true);
    });
    expect(result.current).toBe(false);
  });

  it('hides Sign in / Sign up when cloud sync is off', () => {
    vi.mocked(isCloudSyncEnabled).mockReturnValue(false);
    act(() => {
      setSessionAuthState(true, false);
    });
    const { result } = renderHook(() => useShowMarketingSignInUp());
    expect(result.current).toBe(false);
  });
});
