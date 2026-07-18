import { useSyncExternalStore } from 'react';
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
  return sessionMode === 'cloud' || sessionMode === 'connecting';
}

export function useCanDeleteLibraryItems(): boolean {
  const mode = useSessionMode();
  return mode === 'local' || mode === 'cloud';
}
