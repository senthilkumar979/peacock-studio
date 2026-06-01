import { Link, useParams, useSearchParams } from 'react-router-dom';
import { EmptyFlowState } from '@/components/EmptyFlowState';
import { PeacockStudioLoader } from '@/components/PeacockStudioLoader';
import { useSavedDocument } from '@/hooks/useSavedDocument';
import { DocumentView } from '@/player/DocumentView';
import { PlayerView } from '@/player/PlayerView';
import { useFlowStore, usePlayableSteps } from '@/store/flowStore';
import type { SharedDocumentViewMode } from '@/utils/shareLink';

export const Player = () => {
  const { documentId } = useParams<{ documentId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const { isLoading, isLoaded, error } = useSavedDocument(documentId);
  const outline = useFlowStore((state) => state.steps);
  const playableSteps = usePlayableSteps();
  const viewMode: SharedDocumentViewMode =
    searchParams.get('view') === 'player' ? 'player' : 'doc';

  const handleModeChange = (mode: SharedDocumentViewMode) => {
    if (mode === 'doc') {
      setSearchParams({}, { replace: true });
      return;
    }

    setSearchParams({ view: 'player' }, { replace: true });
  };

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
          <Link to="/" className="font-medium underline">
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

  if (!outline.length) {
    return (
      <EmptyFlowState title="No content yet" description="This documentation has no steps or sections yet." />
    );
  }

  if (viewMode === 'player' && playableSteps.length === 0) {
    return (
      <EmptyFlowState
        title="No steps to play"
        description="Add steps in the editor. Chapter sections can display in player mode once steps exist below them."
      />
    );
  }

  if (viewMode === 'player') {
    return <PlayerView documentId={documentId} onModeChange={handleModeChange} />;
  }

  return <DocumentView documentId={documentId} onModeChange={handleModeChange} />;
};
