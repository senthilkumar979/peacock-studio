import { useCallback, useMemo, useState } from 'react';
import {
  dismissFirstTimeHint,
  dismissFirstTimeHintSequence,
  getNextDashboardHintId,
  getNextHintInSequence,
  isFirstTimeHintDismissed,
  type DashboardHintId,
} from '@/constants/firstTimeHints';

interface UseFirstTimeHintTourOptions {
  enabled?: boolean;
  ready?: boolean;
}

export function useFirstTimeHintTour(
  hintIds: readonly string[],
  options: UseFirstTimeHintTourOptions = {},
) {
  const enabled = options.enabled ?? true;
  const ready = options.ready ?? true;
  const [revision, setRevision] = useState(0);

  const activeHintId = useMemo(() => {
    if (!enabled || !ready) return null;
    return getNextHintInSequence(hintIds);
  }, [enabled, hintIds, ready, revision]);

  const dismissHint = useCallback((hintId: string) => {
    dismissFirstTimeHint(hintId);
    setRevision((value) => value + 1);
  }, []);

  const skipAllHints = useCallback(() => {
    dismissFirstTimeHintSequence(hintIds);
    setRevision((value) => value + 1);
  }, [hintIds]);

  return { activeHintId, dismissHint, skipAllHints };
}

interface UseDashboardFirstTimeHintOptions {
  isLibraryLoading: boolean;
  hasDocuments: boolean;
  enabled?: boolean;
}

export function useDashboardFirstTimeHint({
  isLibraryLoading,
  hasDocuments,
  enabled = true,
}: UseDashboardFirstTimeHintOptions) {
  const [revision, setRevision] = useState(0);

  const activeHintId = useMemo(() => {
    if (!enabled) return null;
    return getNextDashboardHintId({
      isLibraryLoading,
      hasDocuments,
    });
  }, [enabled, hasDocuments, isLibraryLoading, revision]);

  const dismissHint = useCallback((hintId: DashboardHintId) => {
    dismissFirstTimeHint(hintId);
    setRevision((value) => value + 1);
  }, []);

  return { activeHintId, dismissHint };
}

export function useFirstTimeHint(hintId: string) {
  const [revision, setRevision] = useState(0);

  const isDismissed = useMemo(
    () => isFirstTimeHintDismissed(hintId),
    [hintId, revision],
  );

  const dismiss = useCallback(() => {
    dismissFirstTimeHint(hintId);
    setRevision((value) => value + 1);
  }, [hintId]);

  return { isDismissed, dismiss };
}
