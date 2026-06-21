import { useEffect } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { DASHBOARD_PATH } from '@/constants/routes';
import { EmptyFlowState } from '@/components/EmptyFlowState';
import { PeacockStudioLoader } from '@/components/PeacockStudioLoader';
import { useSavedDocument } from '@/hooks/useSavedDocument';
import { DocumentView } from '@/player/DocumentView';
import { PlayerView } from '@/player/PlayerView';
import { useFlowStore } from '@/store/flowStore';
import { parseShareSearchParams } from '@/utils/flowShareSettings';
import type { SharedDocumentViewMode } from '@/utils/shareLink';

export const Player = () => {
  const { documentId } = useParams<{ documentId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const { isLoading, isLoaded, error } = useSavedDocument(documentId);
  const rawSteps = useFlowStore((state) => state.steps);
  const shareSettings = useFlowStore((state) => state.shareSettings);
  const setViewerFilter = useFlowStore((state) => state.setViewerFilter);
  const viewMode: SharedDocumentViewMode =
    searchParams.get('view') === 'player' ? 'player' : 'doc';

  useEffect(() => {
    if (!isLoaded) return;
    const filter = parseShareSearchParams(searchParams, rawSteps, shareSettings ?? undefined);
    setViewerFilter(filter);
    return () => setViewerFilter(null);
  }, [isLoaded, searchParams, rawSteps, shareSettings, setViewerFilter]);

  const handleModeChange = (mode: SharedDocumentViewMode) => {
    const next = new URLSearchParams(searchParams);
    if (mode === 'doc') {
      next.delete('view');
    } else {
      next.set('view', 'player');
    }
    setSearchParams(next, { replace: true });
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

  if (viewMode === 'player') {
    return <PlayerView documentId={documentId} onModeChange={handleModeChange} />;
  }

  return <DocumentView documentId={documentId} onModeChange={handleModeChange} />;
};
