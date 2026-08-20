import { useSyncExternalStore } from 'react';
import { isCloudSyncEnabled } from '@/cloud/config';
import {
  getSessionAuthLoadedSnapshot,
  getSessionSignedInSnapshot,
  subscribeSessionAuth,
} from '@/cloud/sessionState';

/**
 * Marketing nav Sign in / Sign up — only after Clerk reports a signed-out session.
 * While auth is loading, hide those links so a signed-in user never flashes them.
 */
export function useShowMarketingSignInUp(): boolean {
  const isAuthLoaded = useSyncExternalStore(
    subscribeSessionAuth,
    getSessionAuthLoadedSnapshot,
    getSessionAuthLoadedSnapshot,
  );
  const isSignedIn = useSyncExternalStore(
    subscribeSessionAuth,
    getSessionSignedInSnapshot,
    getSessionSignedInSnapshot,
  );

  if (!isCloudSyncEnabled()) return false;
  return isAuthLoaded && !isSignedIn;
}
