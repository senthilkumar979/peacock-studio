import { useEffect } from 'react';
import { useAuth, useSession, useUser } from '@clerk/react';
import { setCloudAuthContext, setCloudInitError } from '@/cloud/authContext';
import { fetchClerkSupabaseAccessToken } from '@/cloud/clerkSupabaseToken';
import { getCloudInitErrorMessage } from '@/cloud/cloudInitErrors';
import {
  importLocalLibraryToCloud,
  countLocalLibraryItems,
} from '@/cloud/importLocalLibrary';
import { getFreeAccountDocLimit } from '@/cloud/planLimits';
import { setCloudSyncState, resetCloudSyncState } from '@/cloud/cloudSyncState';
import { isCloudSyncEnabled } from '@/cloud/config';
import { ensureOrganization } from '@/cloud/ensureOrganization';
import { resetSupabaseClientCache } from '@/cloud/supabaseClient';
import { setSessionAuthState } from '@/cloud/sessionState';
import { getCloudEnvValidationError } from '@/cloud/validateCloudEnv';
import { clearLocalLibrary } from '@/storage/flowLibraryDb';

interface CloudSyncProviderProps {
  children: React.ReactNode;
}

const CloudSyncProviderInner = ({ children }: CloudSyncProviderProps) => {
  const { isLoaded, isSignedIn, userId } = useAuth();
  const { session } = useSession();
  const { user } = useUser();

  useEffect(() => {
    let cancelled = false;

    const sync = async () => {
      if (!isLoaded) {
        if (isCloudSyncEnabled()) setSessionAuthState(false, false);
        return;
      }

      setSessionAuthState(true, Boolean(isSignedIn && userId));

      if (!isSignedIn || !userId) {
        setCloudAuthContext(null);
        setCloudInitError(null);
        resetCloudSyncState();
        resetSupabaseClientCache();
        return;
      }

      const envError = getCloudEnvValidationError();
      if (envError) {
        setCloudAuthContext(null);
        setCloudInitError(envError);
        return;
      }

      if (!session) {
        return;
      }

      try {
        setCloudInitError(null);

        const getSessionToken = () => session.getToken();
        await fetchClerkSupabaseAccessToken(getSessionToken);
        if (cancelled) return;

        const organization = await ensureOrganization(
          userId,
          getSessionToken,
          user?.fullName ?? user?.primaryEmailAddress?.emailAddress ?? null,
        );

        if (cancelled) return;

        setCloudAuthContext({
          clerkUserId: userId,
          organizationId: organization.id,
          getAccessToken: () => fetchClerkSupabaseAccessToken(getSessionToken),
        });

        const localCounts = await countLocalLibraryItems();
        const hasLocalData =
          localCounts.documents > 0 || localCounts.personas > 0 || localCounts.tours > 0;

        if (hasLocalData) {
          setCloudSyncState({
            phase: 'syncing',
            message: 'Syncing your library to the cloud…',
            importedDocuments: 0,
            exceedsFreeLimit: false,
          });

          const counts = await importLocalLibraryToCloud();
          await clearLocalLibrary();

          const exceedsFreeLimit = counts.documents > getFreeAccountDocLimit();

          if (counts.documents > 0) {
            setCloudSyncState({
              phase: 'success',
              message: `Synced ${counts.documents} document${counts.documents === 1 ? '' : 's'} to your cloud library.`,
              importedDocuments: counts.documents,
              exceedsFreeLimit,
            });
          } else {
            resetCloudSyncState();
          }
        }
      } catch (error) {
        console.error('[Peacock] Failed to initialize cloud library', error);
        setCloudAuthContext(null);
        setCloudInitError(getCloudInitErrorMessage(error));
        setCloudSyncState({
          phase: 'error',
          message: getCloudInitErrorMessage(error),
          importedDocuments: 0,
          exceedsFreeLimit: false,
        });
        resetSupabaseClientCache();
      }
    };

    void sync();

    return () => {
      cancelled = true;
    };
  }, [
    isLoaded,
    isSignedIn,
    session,
    user?.fullName,
    user?.primaryEmailAddress?.emailAddress,
    userId,
  ]);

  return children;
};

export const CloudSyncProvider = ({ children }: CloudSyncProviderProps) => {
  if (!isCloudSyncEnabled()) {
    return children;
  }

  return <CloudSyncProviderInner>{children}</CloudSyncProviderInner>;
};
