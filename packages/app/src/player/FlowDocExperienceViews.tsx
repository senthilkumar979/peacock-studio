import type { PageHintControl } from '@/components/onboarding/HintAnchor';
import { CloudInitConnectingError } from '@/components/auth/CloudNetworkBlockedNotice';
import { EmbedErrorPanel } from '@/components/embed/EmbedErrorPanel';
import { getCloudNetworkBlockedError } from '@/cloud/cloudInitErrors';
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

const ScreenshotNetworkBlocked = ({ isEmbed }: { isEmbed: boolean }) => {
  const error = getCloudNetworkBlockedError();
  if (isEmbed) {
    return (
      <EmbedErrorPanel
        title={error.title}
        description={error.message}
        workarounds={error.workarounds}
      />
    );
  }
  return (
    <div className="flex min-h-[min(70vh,720px)] flex-col items-center justify-center px-6 py-16">
      <CloudInitConnectingError
        error={error}
        onRetry={() => window.location.reload()}
      />
    </div>
  );
};

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
  const { areScreenshotsReady, screenshotsNetworkBlocked } = usePrefetchFlowScreenshots(
    documentId,
    shouldPrefetch,
  );

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

  if (shouldPrefetch && screenshotsNetworkBlocked) {
    return <ScreenshotNetworkBlocked isEmbed={isEmbed} />;
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
