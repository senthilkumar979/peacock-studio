import { useEffect, useRef } from 'react';
import { useAuth, useSession, useUser } from '@clerk/react';
import {
  buildCloudAuthContext,
  getCloudAuthContext,
  setCloudAuthContext,
  setCloudInitError,
  resolveClerkDisplayName,
  resolveClerkNameParts,
} from '@/cloud/authContext';
import { fetchClerkSupabaseAccessToken } from '@/cloud/clerkSupabaseToken';
import { resetCloudSyncState } from '@/cloud/cloudSyncState';
import { isCloudSyncEnabled } from '@/cloud/config';
import { upsertUserProfile } from '@/cloud/repositories/profileRepository';
import {
  listMyMemberships,
  pickActiveMembership,
  setStoredActiveOrganizationId,
  syncMyMembershipEmails,
} from '@/cloud/repositories/organizationRepository';
import { resetSupabaseClientCache } from '@/cloud/supabaseClient';
import { setSessionAuthState } from '@/cloud/sessionState';
import { getCloudEnvValidationError } from '@/cloud/validateCloudEnv';
import { consumeIntentionalSignOut } from '@/cloud/sessionIntent';
import { GENERIC_USER_ERROR_MESSAGE, logAppError, reportAppError } from '@/utils/appError';
import { notifyError, notifyWarning } from '@/utils/notify';
import { ImportLocalLibraryPrompt } from '@/components/auth/ImportLocalLibraryPrompt';

interface CloudSyncProviderInnerProps {
  children: React.ReactNode;
}

/** Must render under ClerkProvider. Boots session → Supabase cloud library sync. */
export const CloudSyncProviderInner = ({ children }: CloudSyncProviderInnerProps) => {
  const { isLoaded, isSignedIn, userId } = useAuth();
  const { session } = useSession();
  const { user } = useUser();
  const syncedUserIdRef = useRef<string | null>(null);
  const hadCloudSessionRef = useRef(false);

  const userEmail = user?.primaryEmailAddress?.emailAddress?.trim() ?? '';
  const userDisplayName = resolveClerkDisplayName(user) ?? userEmail;
  const { firstName: userFirstName, lastName: userLastName } = resolveClerkNameParts(user);

  useEffect(() => {
    let cancelled = false;

    const sync = async () => {
      if (!isLoaded) {
        if (isCloudSyncEnabled()) setSessionAuthState(false, false);
        return;
      }

      setSessionAuthState(true, Boolean(isSignedIn && userId));

      if (!isSignedIn || !userId) {
        if (hadCloudSessionRef.current && !consumeIntentionalSignOut()) {
          notifyWarning(
            'Session ended',
            'Your session expired or you were signed out. Sign in again to use the cloud library.',
          );
        }
        hadCloudSessionRef.current = false;
        syncedUserIdRef.current = null;
        setCloudAuthContext(null);
        setCloudInitError(null);
        resetCloudSyncState();
        resetSupabaseClientCache();
        return;
      }

      hadCloudSessionRef.current = true;

      const envError = getCloudEnvValidationError();
      if (envError) {
        logAppError('Cloud environment validation failed', envError);
        setCloudAuthContext(null);
        setCloudInitError(GENERIC_USER_ERROR_MESSAGE);
        notifyError('Cloud setup incomplete', GENERIC_USER_ERROR_MESSAGE);
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
        notifyWarning(
          'Email required',
          'A verified primary email is required for cloud sync.',
        );
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
          firstName: userFirstName,
          lastName: userLastName,
        });
        if (cancelled) return;

        try {
          await syncMyMembershipEmails();
        } catch {
          // Non-fatal: roster still resolves emails from profiles client-side.
        }
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
      } catch (error) {
        const classified = reportAppError('Failed to initialize cloud library', error);
        setCloudAuthContext(null);
        setCloudInitError(classified.userMessage);
        notifyError(classified.title, classified.userMessage);
        resetSupabaseClientCache();
      }
    };

    void sync();

    return () => {
      cancelled = true;
    };
  }, [isLoaded, isSignedIn, session, userId, userEmail, userDisplayName, userFirstName, userLastName]);

  return (
    <>
      {children}
      <ImportLocalLibraryPrompt />
    </>
  );
};
