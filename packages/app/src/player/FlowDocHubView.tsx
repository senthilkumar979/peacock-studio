import { useLocation } from 'react-router-dom';
import { FlowDetailsOverviewLayout } from '@/components/flow/FlowDetailsOverviewLayout';
import { useBranchingPlayback } from '@/hooks/useBranchingPlayback';
import { useFlowStore } from '@/store/flowStore';
import type { SharedDocumentViewMode } from '@/utils/shareLink';
import { FlowDocHubHeader } from '@/player/FlowDocHubHeader';
import { FlowDocJourneyStrip } from '@/player/FlowDocJourneyStrip';
import { FlowDocModeChooser } from '@/player/FlowDocModeChooser';
import { FlowDocQuickGlance } from '@/player/FlowDocQuickGlance';

interface FlowDocHubViewProps {
  documentId: string;
  onSelectMode: (mode: SharedDocumentViewMode) => void;
  showOwnerActions?: boolean;
}

export const FlowDocHubView = ({
  documentId,
  onSelectMode,
  showOwnerActions = true,
}: FlowDocHubViewProps) => {
  const location = useLocation();
  const libraryBackState = location.state;
  const flow = useFlowStore((state) => state.flow);
  const playback = useBranchingPlayback();
  const title = flow?.flow.title ?? 'Untitled Flow';

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <FlowDocHubHeader
        documentId={documentId}
        title={title}
        version={flow?.flow.version}
        editHref={`/docs/${documentId}/edit`}
        editLinkState={libraryBackState}
        showOwnerActions={showOwnerActions}
      />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
        <div className="flex flex-col gap-6 sm:gap-8">
          <FlowDetailsOverviewLayout
            variant="hub"
            documentId={documentId}
            title={title}
            description={flow?.flow.description ?? ''}
            version={flow?.flow.version ?? ''}
            captureEnvironment={flow?.metadata.captureEnvironment ?? null}
            createdAt={flow?.metadata.createdAt}
            stepCount={playback.playableStepCount}
            sectionCount={playback.sectionCount}
            branchCount={playback.branchCount}
          />

          <FlowDocJourneyStrip
            segments={playback.segments}
            stepCount={playback.playableStepCount}
            sectionCount={playback.sectionCount}
            branchCount={playback.branchCount}
          />

          <FlowDocQuickGlance
            documentId={documentId}
            captureEnvironment={flow?.metadata.captureEnvironment ?? null}
          />

          <FlowDocModeChooser onSelectMode={onSelectMode} />
        </div>
      </main>
    </div>
  );
};
