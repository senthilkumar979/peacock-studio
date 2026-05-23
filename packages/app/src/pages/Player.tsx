import { Link } from 'react-router-dom';
import { EmptyFlowState } from '@/components/EmptyFlowState';
import { usePayload } from '@/hooks/usePayload';
import { PlayerView } from '@/player/PlayerView';
import { useFlowStore } from '@/store/flowStore';

export const Player = () => {
  const { isLoading, isLoaded, error } = usePayload();
  const steps = useFlowStore((state) => state.steps);

  if (error) {
    return (
      <div className="min-h-screen">
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
    return <div className="px-6 py-3 text-sm text-slate-500">Waiting for flow from extension…</div>;
  }

  if (!isLoaded) {
    return (
      <EmptyFlowState
        title="No flow loaded"
        description="Record a flow with the Peacock extension, or open the editor first."
      />
    );
  }

  if (!steps.length) {
    return (
      <EmptyFlowState title="No steps to play" description="This flow has no steps yet." />
    );
  }

  return <PlayerView />;
};
