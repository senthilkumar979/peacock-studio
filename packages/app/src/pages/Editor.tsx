import { Link, useParams } from 'react-router-dom';
import { Canvas } from '@/editor/Canvas';
import { StepList } from '@/editor/StepList';
import { StepPanel } from '@/editor/StepPanel';
import { Toolbar } from '@/editor/Toolbar';
import { usePayload } from '@/hooks/usePayload';
import { usePersistDocument } from '@/hooks/usePersistDocument';
import { useSavedDocument } from '@/hooks/useSavedDocument';
import { useSelectedStep } from '@/store/flowStore';
import { PeacockStudioLoader } from '@/components/PeacockStudioLoader';

export const Editor = () => {
  const { documentId } = useParams<{ documentId: string }>();
  const isExtensionHandoff = !documentId;

  const payload = usePayload({ enabled: isExtensionHandoff });
  const saved = useSavedDocument(documentId);

  const { isLoading, isLoaded, error } = isExtensionHandoff ? payload : saved;
  usePersistDocument(Boolean(documentId && isLoaded));

  const selectedStep = useSelectedStep();

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <Toolbar documentId={documentId} />

      {error && (
        <div className="border-b border-amber-200 bg-amber-50 px-6 py-3 text-sm text-amber-800">
          {error}{' '}
          <Link to="/" className="font-medium underline">
            Go to dashboard
          </Link>
        </div>
      )}

      {isLoading && (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-12">
          <PeacockStudioLoader size={160} />
          <p className="text-sm text-slate-500">
            {isExtensionHandoff ? 'Waiting for flow from extension…' : 'Loading documentation…'}
          </p>
        </div>
      )}

      {!isLoaded && !isLoading && !error && (
        <div className="flex flex-1 items-center justify-center p-8">
          <div className="max-w-md rounded-xl border border-slate-200 bg-white p-6 text-center shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">No flow loaded</h2>
            <p className="mt-2 text-sm text-slate-600">
              Record steps with the Peacock extension, then stop recording to open the editor.
            </p>
            <Link to="/" className="btn-peacock mt-4">
              Back to dashboard
            </Link>
          </div>
        </div>
      )}

      {isLoaded && (
        <div className="grid min-h-0 flex-1 grid-cols-[280px_1fr_320px] gap-4 p-4">
          <aside className="flex min-h-0 flex-col overflow-hidden rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200">
            <StepList />
          </aside>
          <main className="min-h-0 overflow-hidden rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200">
            <Canvas step={selectedStep} />
          </main>
          <aside className="min-h-0 overflow-hidden rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200">
            <StepPanel step={selectedStep} />
          </aside>
        </div>
      )}
    </div>
  );
};
