import { useEffect } from 'react';
import { useAuth } from '@clerk/react';
import { setSessionAuthState } from '@/cloud/sessionState';

/** Syncs Clerk session onto marketing routes where cloud sync stays off. */
export const ClerkSessionAuthBridge = () => {
  const { isLoaded, isSignedIn, userId } = useAuth();

  useEffect(() => {
    if (!isLoaded) {
      setSessionAuthState(false, false);
      return;
    }
    setSessionAuthState(true, Boolean(isSignedIn && userId));
  }, [isLoaded, isSignedIn, userId]);

  return null;
};
