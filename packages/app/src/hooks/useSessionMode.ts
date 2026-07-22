import { useSyncExternalStore } from 'react';
import { hasCapability } from '@/cloud/authContext';
import { isCloudSyncEnabled } from '@/cloud/config';
import {
  getSessionModeSnapshot,
  subscribeSessionMode,
  type SessionMode,
} from '@/cloud/sessionState';

export type { SessionMode };

export function useSessionMode(): SessionMode {
  return useSyncExternalStore(subscribeSessionMode, getSessionModeSnapshot, () =>
    getSessionModeSnapshot(),
  );
}

export function useIsGuestSession(): boolean {
  return useSessionMode() === 'guest';
}

export function useIsAuthenticatedAppUser(): boolean {
  const sessionMode = useSessionMode();
  if (!isCloudSyncEnabled()) return true;
  return sessionMode === 'cloud' || sessionMode === 'connecting' || sessionMode === 'onboarding';
}

export function useCanDeleteLibraryItems(): boolean {
  const mode = useSessionMode();
  if (mode === 'local') return true;
  if (mode !== 'cloud') return false;
  return hasCapability('delete');
}
