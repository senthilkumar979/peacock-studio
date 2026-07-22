import type { PageHintControl } from '@/components/onboarding/HintAnchor';
import type { FlowDocResolvedView } from '@/utils/resolveFlowDocView';
import type { SharedDocumentViewMode } from '@/utils/shareLink';
import { DocumentView } from '@/player/DocumentView';
import { FlowDocHubView } from '@/player/FlowDocHubView';
import { PlayerView } from '@/player/PlayerView';

interface FlowDocExperienceViewsProps {
  documentId: string;
  resolvedView: FlowDocResolvedView;
  onModeChange: (mode: SharedDocumentViewMode) => void;
  onOverview: () => void;
  pageHints?: PageHintControl;
  showOwnerActions?: boolean;
}

export const FlowDocExperienceViews = ({
  documentId,
  resolvedView,
  onModeChange,
  onOverview,
  pageHints,
  showOwnerActions = true,
}: FlowDocExperienceViewsProps) => {
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
        onOverview={onOverview}
        pageHints={pageHints}
        showOwnerActions={showOwnerActions}
      />
    );
  }

  return (
    <DocumentView
      documentId={documentId}
      onModeChange={onModeChange}
      onOverview={onOverview}
      pageHints={pageHints}
      showOwnerActions={showOwnerActions}
    />
  );
};
