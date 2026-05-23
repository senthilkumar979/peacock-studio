import { Link, useParams } from 'react-router-dom';
import { EmptyFlowState } from '@/components/EmptyFlowState';
import { PeacockStudioLoader } from '@/components/PeacockStudioLoader';
import { useSavedDocument } from '@/hooks/useSavedDocument';
import { PlayerView } from '@/player/PlayerView';
import { useFlowStore } from '@/store/flowStore';

export const Player = () => {
  const { documentId } = useParams<{ documentId: string }>();
  const { isLoading, isLoaded, error } = useSavedDocument(documentId);
  const steps = useFlowStore((state) => state.steps);

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

  if (!steps.length) {
    return (
      <EmptyFlowState title="No steps to play" description="This documentation has no steps yet." />
    );
  }

  return <PlayerView documentId={documentId} />;
};
