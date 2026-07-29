import type { PageHintControl } from '@/components/onboarding/HintAnchor';
import { usePrefetchFlowScreenshots } from '@/hooks/usePrefetchFlowScreenshots';
import type { FlowDocResolvedView } from '@/utils/resolveFlowDocView';
import type { SharedDocumentViewMode } from '@/utils/shareLink';
import { DocumentView } from '@/player/DocumentView';
import { FlowDocHubView } from '@/player/FlowDocHubView';
import { PlayerView } from '@/player/PlayerView';
import { useLayoutEffect } from 'react';

interface FlowDocExperienceViewsProps {
  documentId: string;
  resolvedView: FlowDocResolvedView;
  onModeChange: (mode: SharedDocumentViewMode) => void;
  onOverview: () => void;
  pageHints?: PageHintControl;
  showOwnerActions?: boolean;
  isEmbed?: boolean;
  isPresenter?: boolean;
}

export const FlowDocExperienceViews = ({
  documentId,
  resolvedView,
  onModeChange,
  onOverview,
  pageHints,
  showOwnerActions = true,
  isEmbed = false,
  isPresenter = false,
}: FlowDocExperienceViewsProps) => {
  const shouldPrefetch = resolvedView === 'player' || resolvedView === 'doc';
  const { areScreenshotsReady } = usePrefetchFlowScreenshots(documentId, shouldPrefetch);

  useLayoutEffect(() => {
    if (resolvedView !== 'doc') return;
    window.scrollTo(0, 0);
  }, [resolvedView]);

  if (resolvedView === 'hub') {
    return (
      <FlowDocHubView
        documentId={documentId}
        onSelectMode={onModeChange}
        showOwnerActions={showOwnerActions}
      />
    );
  }

  if (resolvedView === 'player') {
    return (
      <PlayerView
        documentId={documentId}
        onModeChange={onModeChange}
        onOverview={isEmbed ? undefined : onOverview}
        pageHints={pageHints}
        showOwnerActions={showOwnerActions}
        isEmbed={isEmbed}
        isPresenter={isPresenter}
      />
    );
  }

  return (
    <DocumentView
      documentId={documentId}
      onModeChange={onModeChange}
      onOverview={isEmbed ? undefined : onOverview}
      pageHints={pageHints}
      showOwnerActions={showOwnerActions}
      isEmbed={isEmbed}
      areScreenshotsReady={areScreenshotsReady}
    />
  );
};
