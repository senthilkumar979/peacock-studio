import { useEffect, useState } from 'react';
import { resolvePublicShareLink } from '@/cloud/publicShareClient';
import { setPublicShareToken } from '@/cloud/publicShareContext';
import { recordShareEvent } from '@/cloud/repositories/analyticsRepository';
import { isCloudSyncEnabled } from '@/cloud/config';
import { getReferrerDomain, getUtmParams } from '@/utils/referrer';
import type { ResolvedShareLink } from '@/types/shareLink';

export function usePublicShare(token: string | undefined) {
  const [link, setLink] = useState<ResolvedShareLink | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(token));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setLink(null);
      setIsLoading(false);
      setError('Missing share link.');
      return;
    }

    if (!isCloudSyncEnabled()) {
      setLink(null);
      setIsLoading(false);
      setError('Public share links require cloud sync to be enabled.');
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setError(null);
    setPublicShareToken(token);

    void resolvePublicShareLink(token)
      .then((resolved) => {
        if (cancelled) return;
        if (!resolved) {
          setLink(null);
          setError('This share link is invalid or has expired.');
          return;
        }
        setLink(resolved);
        void recordShareEvent(token, 'share_view', getReferrerDomain(), {
          resourceType: resolved.resourceType,
          ...getUtmParams(),
        });
      })
      .catch((resolveError) => {
        console.error('[Peacock] Failed to resolve share link', resolveError);
        if (!cancelled) {
          setError('Could not load this share link.');
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
      setPublicShareToken(null);
    };
  }, [token]);

  return { link, isLoading, error };
}
