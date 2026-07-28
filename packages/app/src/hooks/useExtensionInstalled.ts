import { useCallback, useEffect, useState } from 'react';
import { probeExtensionInstalled } from '@/utils/probeExtensionInstalled';

export type ExtensionInstallStatus = 'checking' | 'installed' | 'missing';

interface UseExtensionInstalledResult {
  status: ExtensionInstallStatus;
  isInstalled: boolean;
  isChecking: boolean;
  recheck: () => void;
}

/**
 * Detects whether the Peacock browser extension is installed and reachable from
 * this origin. Rechecks when the tab becomes visible again so users returning
 * from the Web Store see an updated status without a full reload.
 */
export function useExtensionInstalled(): UseExtensionInstalledResult {
  const [status, setStatus] = useState<ExtensionInstallStatus>('checking');

  const runProbe = useCallback(() => {
    setStatus('checking');
    void probeExtensionInstalled().then((installed) => {
      setStatus(installed ? 'installed' : 'missing');
    });
  }, []);

  useEffect(() => {
    runProbe();

    const onVisibility = () => {
      if (document.visibilityState === 'visible') runProbe();
    };

    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, [runProbe]);

  return {
    status,
    isInstalled: status === 'installed',
    isChecking: status === 'checking',
    recheck: runProbe,
  };
}
