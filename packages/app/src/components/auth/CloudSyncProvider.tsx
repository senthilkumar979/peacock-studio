import { useEffect, useRef } from 'react';
import { useAuth, useSession, useUser } from '@clerk/react';
import {
  buildCloudAuthContext,
  getCloudAuthContext,
  setCloudAuthContext,
  setCloudInitError,
  resolveClerkDisplayName,
} from '@/cloud/authContext';
import { fetchClerkSupabaseAccessToken } from '@/cloud/clerkSupabaseToken';
import {
  importLocalLibraryToCloud,
  countLocalLibraryItems,
} from '@/cloud/importLocalLibrary';
import { getFreeAccountDocLimit } from '@/cloud/planLimits';
import { setCloudSyncState, resetCloudSyncState } from '@/cloud/cloudSyncState';
import { isCloudSyncEnabled } from '@/cloud/config';
import { upsertUserProfile } from '@/cloud/repositories/profileRepository';
import {
  listMyMemberships,
  pickActiveMembership,
  setStoredActiveOrganizationId,
} from '@/cloud/repositories/organizationRepository';
import { resetSupabaseClientCache } from '@/cloud/supabaseClient';
import { setSessionAuthState } from '@/cloud/sessionState';
import { getCloudEnvValidationError } from '@/cloud/validateCloudEnv';
import { clearLocalLibrary } from '@/storage/flowLibraryDb';
import { GENERIC_USER_ERROR_MESSAGE, logAppError } from '@/utils/appError';

interface CloudSyncProviderProps {
  children: React.ReactNode;
}

const CloudSyncProviderInner = ({ children }: CloudSyncProviderProps) => {
  const { isLoaded, isSignedIn, userId } = useAuth();
  const { session } = useSession();
  const { user } = useUser();
  const syncedUserIdRef = useRef<string | null>(null);
  const localImportDoneRef = useRef(false);

  const userEmail = user?.primaryEmailAddress?.emailAddress?.trim() ?? '';
  const userDisplayName = resolveClerkDisplayName(user) ?? userEmail;

  useEffect(() => {
    let cancelled = false;

    const sync = async () => {
      if (!isLoaded) {
        if (isCloudSyncEnabled()) setSessionAuthState(false, false);
        return;
      }

      setSessionAuthState(true, Boolean(isSignedIn && userId));

      if (!isSignedIn || !userId) {
        syncedUserIdRef.current = null;
        localImportDoneRef.current = false;
        setCloudAuthContext(null);
        setCloudInitError(null);
        resetCloudSyncState();
        resetSupabaseClientCache();
        return;
      }

      const envError = getCloudEnvValidationError();
      if (envError) {
        logAppError('Cloud environment validation failed', envError);
        setCloudAuthContext(null);
        setCloudInitError(GENERIC_USER_ERROR_MESSAGE);
        return;
      }

      if (!session) return;

      if (!userEmail) {
        logAppError(
          'Failed to initialize cloud library',
          new Error('A verified primary email is required for cloud sync.'),
        );
        setCloudAuthContext(null);
        setCloudInitError(GENERIC_USER_ERROR_MESSAGE);
        return;
      }

      try {
        setCloudInitError(null);

        const getSessionToken = () => session.getToken();
        await fetchClerkSupabaseAccessToken(getSessionToken);
        if (cancelled) return;

        const getAccessToken = () => fetchClerkSupabaseAccessToken(getSessionToken);
        const existing = getCloudAuthContext();
        const sameUser = existing?.clerkUserId === userId;

        // Keep an already-resolved workspace during soft refreshes so the chooser
        // never flashes. Only first load (or user switch) starts unresolved.
        if (sameUser && existing.workspaceResolved && existing.memberships.length > 0) {
          setCloudAuthContext({
            ...existing,
            userEmail,
            userDisplayName,
            getAccessToken,
          });
        } else if (!sameUser || !existing) {
          setCloudAuthContext(
            buildCloudAuthContext({
              clerkUserId: userId,
              userEmail,
              userDisplayName,
              memberships: [],
              activeMembership: null,
              workspaceResolved: false,
              getAccessToken,
            }),
          );
        } else {
          // Soft refresh while unresolved, or same user with empty memberships:
          // stay unresolved / keep current flags — do not force onboarding mid-fetch.
          setCloudAuthContext({
            ...existing,
            userEmail,
            userDisplayName,
            getAccessToken,
            workspaceResolved: false,
            needsWorkspaceOnboarding: false,
          });
        }

        await upsertUserProfile({
          email: userEmail,
          clerkUserId: userId,
          displayName: userDisplayName,
        });
        if (cancelled) return;

        const memberships = await listMyMemberships();
        if (cancelled) return;

        const activeMembership = pickActiveMembership(memberships);
        if (activeMembership) {
          setStoredActiveOrganizationId(activeMembership.organizationId);
        }

        setCloudAuthContext(
          buildCloudAuthContext({
            clerkUserId: userId,
            userEmail,
            userDisplayName,
            memberships,
            activeMembership,
            workspaceResolved: true,
            getAccessToken,
          }),
        );
        syncedUserIdRef.current = userId;

        if (!activeMembership) {
          return;
        }

        // Import local library at most once per signed-in session
        if (localImportDoneRef.current) return;
        localImportDoneRef.current = true;

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
        logAppError('Failed to initialize cloud library', error);
        setCloudAuthContext(null);
        setCloudInitError(GENERIC_USER_ERROR_MESSAGE);
        setCloudSyncState({
          phase: 'error',
          message: GENERIC_USER_ERROR_MESSAGE,
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
  }, [isLoaded, isSignedIn, session, userId, userEmail, userDisplayName]);

  return children;
};

export const CloudSyncProvider = ({ children }: CloudSyncProviderProps) => {
  if (!isCloudSyncEnabled()) {
    return children;
  }

  return <CloudSyncProviderInner>{children}</CloudSyncProviderInner>;
};

/** Refresh memberships and active org after onboarding / invite / switch. */
export async function refreshCloudMemberships(preferredOrganizationId?: string): Promise<void> {
  const context = getCloudAuthContext();
  if (!context) return;

  const memberships = await listMyMemberships();
  const activeMembership = pickActiveMembership(memberships, preferredOrganizationId);
  if (activeMembership) {
    setStoredActiveOrganizationId(activeMembership.organizationId);
  }

  setCloudAuthContext(
    buildCloudAuthContext({
      clerkUserId: context.clerkUserId,
      userEmail: context.userEmail,
      userDisplayName: context.userDisplayName,
      memberships,
      activeMembership,
      workspaceResolved: true,
      getAccessToken: context.getAccessToken,
    }),
  );
}
