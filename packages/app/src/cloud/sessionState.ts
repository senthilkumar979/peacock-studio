import { isCloudLibraryActive, subscribeCloudAuthContext } from '@/cloud/authContext';
import { isCloudSyncEnabled } from '@/cloud/config';

export type SessionMode = 'local' | 'loading' | 'guest' | 'connecting' | 'cloud';

let authLoaded = false;
let isSignedIn = false;
const sessionListeners = new Set<() => void>();

function notifySessionListeners(): void {
  sessionListeners.forEach((listener) => listener());
}

export function setSessionAuthState(loaded: boolean, signedIn: boolean): void {
  authLoaded = loaded;
  isSignedIn = signedIn;
  notifySessionListeners();
}

export function subscribeSessionAuth(listener: () => void): () => void {
  sessionListeners.add(listener);
  return () => sessionListeners.delete(listener);
}

export function getSessionAuthLoadedSnapshot(): boolean {
  return authLoaded;
}

export function getSessionSignedInSnapshot(): boolean {
  return isSignedIn;
}

export function getSessionModeSnapshot(): SessionMode {
  if (!isCloudSyncEnabled()) return 'local';
  if (!authLoaded) return 'loading';
  if (!isSignedIn) return 'guest';
  if (!isCloudLibraryActive()) return 'connecting';
  return 'cloud';
}

export function subscribeSessionMode(listener: () => void): () => void {
  const unsubscribeAuth = subscribeSessionAuth(listener);
  const unsubscribeCloud = subscribeCloudAuthContext(listener);
  return () => {
    unsubscribeAuth();
    unsubscribeCloud();
  };
}

export function isGuestSessionSnapshot(): boolean {
  return getSessionModeSnapshot() === 'guest';
}
