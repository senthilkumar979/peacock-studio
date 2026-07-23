import { useEffect, useState } from 'react';
import { resolvePublicShareLink } from '@/cloud/publicShareClient';
import { setPublicShareToken } from '@/cloud/publicShareContext';
import { recordShareEvent } from '@/cloud/repositories/analyticsRepository';
import { isCloudSyncEnabled } from '@/cloud/config';
import { useCloudAuthContext } from '@/hooks/useOrganization';
import { useSessionMode } from '@/hooks/useSessionMode';
import { getEmbedHostDomain, getReferrerDomain, getUtmParams } from '@/utils/referrer';
import type { ResolvedShareLink } from '@/types/shareLink';
import type { ShareAnalyticsEventType } from '@/types/analytics';
import { reportAppError } from '@/utils/appError';

interface UsePublicShareOptions {
  /** When true, records `embed_view` with embed-host domain instead of `share_view`. */
  isEmbed?: boolean;
}

export function usePublicShare(token: string | undefined, options: UsePublicShareOptions = {}) {
  const isEmbed = Boolean(options.isEmbed);
  const sessionMode = useSessionMode();
  const cloudAuth = useCloudAuthContext();
  const [link, setLink] = useState<ResolvedShareLink | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(token));
  const [error, setError] = useState<string | null>(null);
  const [errorTitle, setErrorTitle] = useState<string | null>(null);
  const [requiresSignIn, setRequiresSignIn] = useState(false);

  const authSettling = sessionMode === 'loading' || sessionMode === 'connecting';
  const isSignedIn = Boolean(cloudAuth?.clerkUserId);

  useEffect(() => {
    if (!token) {
      setLink(null);
      setIsLoading(false);
      setRequiresSignIn(false);
      setErrorTitle('Missing share link');
      setError('This share URL is incomplete. Ask for a new link.');
      return;
    }

    if (!isCloudSyncEnabled()) {
      setLink(null);
      setIsLoading(false);
      setRequiresSignIn(false);
      setErrorTitle('Cloud sync required');
      setError('Public share links require cloud sync to be enabled.');
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setError(null);
    setErrorTitle(null);
    setRequiresSignIn(false);
    setPublicShareToken(token);

    void resolvePublicShareLink(token)
      .then((resolved) => {
        if (cancelled) return;
        if (!resolved) {
          setLink(null);
          setErrorTitle('Link unavailable');
          setError('This share link is invalid or has expired.');
          return;
        }

        if (resolved.requiresAuth && authSettling) {
          setLink(resolved);
          setIsLoading(true);
          return;
        }

        if (resolved.requiresAuth && !isSignedIn) {
          setLink(resolved);
          setRequiresSignIn(true);
          return;
        }

        setLink(resolved);

        if (!isEmbed && resolved.channel === 'embed') return;

        const eventType: ShareAnalyticsEventType = isEmbed ? 'embed_view' : 'share_view';
        const hostDomain = isEmbed ? getEmbedHostDomain() : getReferrerDomain();
        void recordShareEvent(token, eventType, hostDomain, {
          resourceType: resolved.resourceType,
          channel: resolved.channel,
          presentation: isEmbed ? 'embed' : 'share',
          embedHost: hostDomain,
          ...getUtmParams(),
        });
      })
      .catch((resolveError) => {
        if (!cancelled) {
          const classified = reportAppError('Resolve share link', resolveError);
          setErrorTitle(classified.title);
          setError(classified.userMessage);
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
      setPublicShareToken(null);
    };
  }, [token, isEmbed, authSettling, isSignedIn]);

  const waitingForAuth = Boolean(link?.requiresAuth && authSettling && !isSignedIn);

  return {
    link,
    isLoading: isLoading || waitingForAuth,
    error,
    errorTitle,
    requiresSignIn,
  };
}
