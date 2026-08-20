import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render } from '@testing-library/react';
import { ClerkSessionAuthBridge } from './ClerkSessionAuthBridge';

const { useAuth } = vi.hoisted(() => ({
  useAuth: vi.fn(() => ({ isLoaded: false, isSignedIn: false, userId: null as string | null })),
}));

vi.mock('@clerk/react', () => ({
  useAuth: () => useAuth(),
}));

vi.mock('@/cloud/sessionState', () => ({
  setSessionAuthState: vi.fn(),
}));

import { setSessionAuthState } from '@/cloud/sessionState';

describe('ClerkSessionAuthBridge', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('keeps auth unloaded until Clerk reports', () => {
    useAuth.mockReturnValue({ isLoaded: false, isSignedIn: false, userId: null });
    render(<ClerkSessionAuthBridge />);
    expect(setSessionAuthState).toHaveBeenCalledWith(false, false);
  });

  it('marks the session signed in when Clerk has a user', () => {
    useAuth.mockReturnValue({ isLoaded: true, isSignedIn: true, userId: 'user_1' });
    render(<ClerkSessionAuthBridge />);
    expect(setSessionAuthState).toHaveBeenCalledWith(true, true);
  });

  it('marks the session signed out when Clerk has no user', () => {
    useAuth.mockReturnValue({ isLoaded: true, isSignedIn: false, userId: null });
    render(<ClerkSessionAuthBridge />);
    expect(setSessionAuthState).toHaveBeenCalledWith(true, false);
  });
});
