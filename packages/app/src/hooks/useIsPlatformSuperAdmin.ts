import { useEffect, useState } from 'react';
import { fetchPlatformWhoami } from '@/cloud/repositories/platformAdminRepository';
import { useSessionMode } from '@/hooks/useSessionMode';

/**
 * True when the signed-in cloud user is on the server-side SUPER_ADMIN_EMAILS
 * allowlist. False while loading, for guests, or when the check fails.
 */
export function useIsPlatformSuperAdmin(): {
  isPlatformSuperAdmin: boolean;
  isLoading: boolean;
} {
  const sessionMode = useSessionMode();
  const [isPlatformSuperAdmin, setIsPlatformSuperAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(sessionMode === 'cloud');

  useEffect(() => {
    if (sessionMode !== 'cloud') {
      setIsPlatformSuperAdmin(false);
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    void fetchPlatformWhoami()
      .then((allowed) => {
        if (!cancelled) setIsPlatformSuperAdmin(allowed);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [sessionMode]);

  return { isPlatformSuperAdmin, isLoading };
}
