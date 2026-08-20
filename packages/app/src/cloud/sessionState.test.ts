import { beforeEach, describe, expect, it, vi } from 'vitest';

const isCloudSyncEnabled = vi.fn(() => true);
const getCloudAuthContext = vi.fn<any>(() => null);
const getCloudInitError = vi.fn<any>(() => null);
const isCloudLibraryActive = vi.fn(() => false);
const subscribeCloudAuthContext = vi.fn((listener: () => void) => {
  return () => undefined;
});

vi.mock('@/cloud/config', () => ({
  isCloudSyncEnabled: () => isCloudSyncEnabled(),
}));

vi.mock('@/cloud/authContext', () => ({
  getCloudAuthContext: () => getCloudAuthContext(),
  getCloudInitError: () => getCloudInitError(),
  isCloudLibraryActive: () => isCloudLibraryActive(),
  subscribeCloudAuthContext: (listener: () => void) => subscribeCloudAuthContext(listener),
}));

import {
  getSessionAuthLoadedSnapshot,
  getSessionModeSnapshot,
  getSessionSignedInSnapshot,
  isGuestSessionSnapshot,
  setSessionAuthState,
  subscribeSessionMode,
} from './sessionState';

describe('sessionState', () => {
  beforeEach(() => {
    setSessionAuthState(false, false);
    isCloudSyncEnabled.mockReturnValue(true);
    getCloudAuthContext.mockReturnValue(null);
    getCloudInitError.mockReturnValue(null);
    isCloudLibraryActive.mockReturnValue(false);
  });

  it('returns local when cloud sync disabled', () => {
    isCloudSyncEnabled.mockReturnValue(false);
    expect(getSessionModeSnapshot()).toBe('local');
  });

  it('returns loading then guest based on auth state', () => {
    expect(getSessionModeSnapshot()).toBe('loading');
    setSessionAuthState(true, false);
    expect(getSessionModeSnapshot()).toBe('guest');
    expect(isGuestSessionSnapshot()).toBe(true);
    expect(getSessionAuthLoadedSnapshot()).toBe(true);
    expect(getSessionSignedInSnapshot()).toBe(false);
  });

  it('returns guest when bootstrap failed with init error', () => {
    setSessionAuthState(true, true);
    getCloudInitError.mockReturnValue('failed');
    expect(getSessionModeSnapshot()).toBe('guest');
  });

  it('returns connecting / onboarding / cloud', () => {
    setSessionAuthState(true, true);
    getCloudAuthContext.mockReturnValue({ workspaceResolved: false });
    expect(getSessionModeSnapshot()).toBe('connecting');

    getCloudAuthContext.mockReturnValue({
      workspaceResolved: true,
      needsWorkspaceOnboarding: true,
    });
    expect(getSessionModeSnapshot()).toBe('onboarding');

    getCloudAuthContext.mockReturnValue({
      workspaceResolved: true,
      needsWorkspaceOnboarding: false,
    });
    isCloudLibraryActive.mockReturnValue(false);
    expect(getSessionModeSnapshot()).toBe('connecting');

    isCloudLibraryActive.mockReturnValue(true);
    expect(getSessionModeSnapshot()).toBe('cloud');
  });

  it('subscribeSessionMode wires auth and cloud listeners', () => {
    const listener = vi.fn();
    const unsubCloud = vi.fn();
    subscribeCloudAuthContext.mockReturnValue(unsubCloud);
    const unsub = subscribeSessionMode(listener);
    setSessionAuthState(true, true);
    expect(listener).toHaveBeenCalled();
    unsub();
    expect(unsubCloud).toHaveBeenCalled();
  });
});
