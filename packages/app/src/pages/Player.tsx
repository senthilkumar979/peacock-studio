import { useEffect, useMemo } from 'react';
import { useLocation, useParams, useSearchParams } from 'react-router-dom';
import {
  getHintStepLabel,
  getPlayerHintSequence,
} from '@/constants/firstTimeHints';
import { GuestDocumentGate } from '@/components/auth/GuestDocumentGate';
import { AppErrorBoundary } from '@/components/errors/AppErrorBoundary';
import { ResourceNotFoundPage } from '@/components/errors/ResourceNotFoundPage';
import { PeacockStudioLoader } from '@/components/PeacockStudioLoader';
import type { PageHintControl } from '@/components/onboarding/HintAnchor';
import { recordOrgEvent } from '@/cloud/repositories/analyticsRepository';
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

  useEffect(() => {
    if (!isLoaded || !documentId) return;
    void recordOrgEvent('document_view', {
      resourceType: 'document',
      resourceId: documentId,
      metadata: { view: resolvedView },
    });
  }, [documentId, isLoaded, resolvedView]);

  const handleModeChange = (mode: SharedDocumentViewMode) => {
    const next = new URLSearchParams(searchParams);
    next.set('view', mode);
    setSearchParams(next, { replace: true });
    if (documentId) {
      void recordOrgEvent('document_mode_change', {
        resourceType: 'document',
        resourceId: documentId,
        metadata: { view: mode },
      });
    }
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
  const { activeHintId, dismissHint, skipAllHints } = useFirstTimeHintTour(playerHintSequence, {
    ready: isLoaded,
  });
  const pageHints: PageHintControl = useMemo(
    () => ({
      activeHintId,
      hintStep: (hintId) => getHintStepLabel(hintId, playerHintSequence),
      dismissHint,
      skipAllHints,
    }),
    [activeHintId, dismissHint, playerHintSequence, skipAllHints],
  );

  if (!documentId) {
    return (
      <ResourceNotFoundPage
        title="Invalid link"
        description="Open documentation from your dashboard or use a shared link."
      />
    );
  }

  if (error) {
    return (
      <ResourceNotFoundPage title="Documentation not found" description={error} />
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
      <ResourceNotFoundPage
        title="Documentation not found"
        description="This documentation was not found. It may have been deleted."
      />
    );
  }

  return (
    <GuestDocumentGate documentId={documentId}>
      <AppErrorBoundary
        compact
        title="Player crashed"
        description="A rendering error stopped the player. You can retry this view or return to your dashboard."
      >
        <FlowDocExperienceViews
          documentId={documentId}
          resolvedView={resolvedView}
          onModeChange={handleModeChange}
          onOverview={handleHubNavigation}
          pageHints={pageHints}
        />
      </AppErrorBoundary>
    </GuestDocumentGate>
  );
};
