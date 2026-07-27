import { useCallback, useEffect, useState } from 'react';
import { useSession } from '@clerk/react';
import type { SuperAdminAcquisitionSummary } from '@/types/superAdminAcquisition';

interface UseSuperAdminAcquisitionResult {
  summary: SuperAdminAcquisitionSummary | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useSuperAdminAcquisition(days = 30): UseSuperAdminAcquisitionResult {
  const { session } = useSession();
  const [summary, setSummary] = useState<SuperAdminAcquisitionSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  const refresh = useCallback(() => {
    setReloadToken((value) => value + 1);
  }, []);

  useEffect(() => {
    if (!session) {
      setSummary(null);
      setIsLoading(false);
      setError('Sign in required');
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setError(null);

    void (async () => {
      try {
        const token = await session.getToken();
        if (!token) throw new Error('Missing session token');

        const response = await fetch(`/api/super-admin/acquisition?days=${days}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const payload = (await response.json()) as SuperAdminAcquisitionSummary & {
          error?: string;
        };

        if (!response.ok) {
          throw new Error(payload.error || 'Failed to load acquisition data');
        }

        if (!cancelled) setSummary(payload);
      } catch (fetchError) {
        if (!cancelled) {
          setSummary(null);
          setError(
            fetchError instanceof Error ? fetchError.message : 'Failed to load acquisition data',
          );
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [days, reloadToken, session]);

  return { summary, isLoading, error, refresh };
}
