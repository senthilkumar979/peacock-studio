import { useCallback, useEffect, useState } from 'react';
import { fetchPlatformAcquisition } from '@/cloud/repositories/platformAdminRepository';
import type { SuperAdminAcquisitionSummary } from '@/types/superAdminAcquisition';

interface UseSuperAdminAcquisitionResult {
  summary: SuperAdminAcquisitionSummary | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useSuperAdminAcquisition(days = 30): UseSuperAdminAcquisitionResult {
  const [summary, setSummary] = useState<SuperAdminAcquisitionSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  const refresh = useCallback(() => {
    setReloadToken((value) => value + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    void (async () => {
      try {
        const payload = await fetchPlatformAcquisition(days);
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
  }, [days, reloadToken]);

  return { summary, isLoading, error, refresh };
}
