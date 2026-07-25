import { useCallback, useEffect, useState } from 'react';
import { useCloudInitError } from '@/hooks/useCloudInitError';
import { formatHealthReport, runHealthChecks } from '@/utils/runHealthChecks';
import type { HealthCheckResult } from '@/types/health';

interface UseHealthChecksResult {
  results: HealthCheckResult[];
  isRunning: boolean;
  ranAt: number | null;
  error: string | null;
  refresh: () => void;
  copyReport: () => Promise<boolean>;
}

export function useHealthChecks(): UseHealthChecksResult {
  const cloudInitError = useCloudInitError();
  const [results, setResults] = useState<HealthCheckResult[]>([]);
  const [isRunning, setIsRunning] = useState(true);
  const [ranAt, setRanAt] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(() => {
    setIsRunning(true);
    setError(null);
    void runHealthChecks(cloudInitError)
      .then((next) => {
        setResults(next);
        setRanAt(Date.now());
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : String(err));
      })
      .finally(() => setIsRunning(false));
  }, [cloudInitError]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const copyReport = useCallback(async () => {
    if (!ranAt) return false;
    try {
      await navigator.clipboard.writeText(formatHealthReport(results, ranAt));
      return true;
    } catch {
      return false;
    }
  }, [results, ranAt]);

  return { results, isRunning, ranAt, error, refresh, copyReport };
}
