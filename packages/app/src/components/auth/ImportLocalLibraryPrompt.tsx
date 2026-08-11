import { useEffect, useRef } from 'react';
import { useAuth, useUser } from '@clerk/react';
import { useSyncExternalStore } from 'react';
import {
  getCloudLibraryActiveSnapshot,
  subscribeCloudAuthContext,
} from '@/cloud/authContext';
import {
  runLocalLibraryImport,
  shouldRunLocalLibraryImport,
} from '@/cloud/runLocalLibraryImport';
import { isCloudSyncEnabled } from '@/cloud/config';

/**
 * After the cloud workspace is ready, import any guest library from this browser.
 * Visible sync progress only on recent signup when flow docs already exist;
 * creation and other sign-ins sync silently in the background.
 * Also recovers libraries stranded by a prior skip/dismiss (e.g. persona seed).
 */
const ImportLocalLibraryRunner = () => {
  const { isSignedIn } = useAuth();
  const { user, isLoaded: isUserLoaded } = useUser();
  const isCloudActive = useSyncExternalStore(
    subscribeCloudAuthContext,
    getCloudLibraryActiveSnapshot,
    () => false,
  );
  const importStartedRef = useRef(false);

  useEffect(() => {
    if (!isSignedIn || !isCloudActive || !isUserLoaded) return;
    if (importStartedRef.current) return;

    let cancelled = false;
    importStartedRef.current = true;

    void (async () => {
      try {
        const shouldRun = await shouldRunLocalLibraryImport();
        if (cancelled) {
          importStartedRef.current = false;
          return;
        }
        if (!shouldRun) return;

        const outcome = await runLocalLibraryImport({
          createdAt: user?.createdAt,
          isCancelled: () => cancelled,
        });

        if (cancelled) {
          if (outcome.status !== 'imported') importStartedRef.current = false;
          return;
        }
        if (outcome.status === 'error') {
          importStartedRef.current = false;
          return;
        }
        if (outcome.status === 'imported') {
          window.location.reload();
        }
      } catch {
        if (!cancelled) importStartedRef.current = false;
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isSignedIn, isCloudActive, isUserLoaded, user?.createdAt]);

  return null;
};

export const ImportLocalLibraryPrompt = () => {
  if (!isCloudSyncEnabled()) return null;

  return <ImportLocalLibraryRunner />;
};
