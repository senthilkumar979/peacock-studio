import { useEffect, useMemo } from 'react';
import { Link, useLocation, useParams, useSearchParams } from 'react-router-dom';
import { DASHBOARD_PATH } from '@/constants/routes';
import {
  getHintStepLabel,
  getPlayerHintSequence,
} from '@/constants/firstTimeHints';
import { GuestDocumentGate } from '@/components/auth/GuestDocumentGate';
import { EmptyFlowState } from '@/components/EmptyFlowState';
import { PeacockStudioLoader } from '@/components/PeacockStudioLoader';
import type { PageHintControl } from '@/components/onboarding/HintAnchor';
import { useFirstTimeHintTour } from '@/hooks/useFirstTimeHint';
import { useSavedDocument } from '@/hooks/useSavedDocument';
import { useFlowDocDefaultView } from '@/hooks/useFlowDocDefaultView';
import { FlowDocExperienceViews } from '@/player/FlowDocExperienceViews';
import { useFlowStore } from '@/store/flowStore';
import { parseShareSearchParams } from '@/utils/flowShareSettings';
import { resolveFlowDocView } from '@/utils/resolveFlowDocView';
import type { SharedDocumentViewMode } from '@/utils/shareLink';

export const Player = () => {
  const { documentId } = useParams<{ documentId: string }>();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const defaultView = useFlowDocDefaultView();
  const { isLoading, isLoaded, error } = useSavedDocument(documentId);
  const rawSteps = useFlowStore((state) => state.steps);
  const shareSettings = useFlowStore((state) => state.shareSettings);
  const setViewerFilter = useFlowStore((state) => state.setViewerFilter);
  const resolvedView = resolveFlowDocView(searchParams, location.hash, defaultView);

  useEffect(() => {
    if (!isLoaded) return;
    const filter = parseShareSearchParams(searchParams, rawSteps, shareSettings ?? undefined);
    setViewerFilter(filter);
    return () => setViewerFilter(null);
  }, [isLoaded, searchParams, rawSteps, shareSettings, setViewerFilter]);

  const handleModeChange = (mode: SharedDocumentViewMode) => {
    const next = new URLSearchParams(searchParams);
    next.set('view', mode);
    setSearchParams(next, { replace: true });
  };

  const handleHubNavigation = () => {
    const next = new URLSearchParams(searchParams);
    next.set('view', 'hub');
    setSearchParams(next, { replace: true });
  };

  const playerHintSequence = useMemo(
    () => getPlayerHintSequence(resolvedView === 'player' ? 'player' : 'doc'),
    [resolvedView],
  );
  const { activeHintId, dismissHint } = useFirstTimeHintTour(playerHintSequence, {
    ready: isLoaded,
  });
  const pageHints: PageHintControl = useMemo(
    () => ({
      activeHintId,
      hintStep: (hintId) => getHintStepLabel(hintId, playerHintSequence),
      dismissHint,
    }),
    [activeHintId, dismissHint, playerHintSequence],
  );

  if (!documentId) {
    return (
      <EmptyFlowState
        title="Invalid link"
        description="Open documentation from your dashboard or use a shared link."
      />
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="border-b border-amber-200 bg-amber-50 px-6 py-3 text-sm text-amber-800">
          {error}{' '}
          <Link to={DASHBOARD_PATH} className="font-medium underline">
            Go to dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50">
        <PeacockStudioLoader size={160} />
        <p className="text-sm text-slate-500">Loading documentation…</p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <EmptyFlowState
        title="Documentation not found"
        description="It may have been deleted from this browser."
      />
    );
  }

  return (
    <GuestDocumentGate documentId={documentId}>
      <FlowDocExperienceViews
        documentId={documentId}
        resolvedView={resolvedView}
        onModeChange={handleModeChange}
        onOverview={handleHubNavigation}
        pageHints={pageHints}
      />
    </GuestDocumentGate>
  );
};
