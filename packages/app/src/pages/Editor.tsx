import { Link } from 'react-router-dom';
import { Canvas } from '@/editor/Canvas';
import { StepList } from '@/editor/StepList';
import { StepPanel } from '@/editor/StepPanel';
import { Toolbar } from '@/editor/Toolbar';
import { usePayload } from '@/hooks/usePayload';
import { useSelectedStep } from '@/store/flowStore';

export const Editor = () => {
  const { isLoading, isLoaded, error } = usePayload();
  const selectedStep = useSelectedStep();

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <Toolbar />

      {error && (
        <div className="border-b border-amber-200 bg-amber-50 px-6 py-3 text-sm text-amber-800">
          {error}{' '}
          <Link to="/" className="font-medium underline">
            Go to dashboard
          </Link>
        </div>
      )}

      {isLoading && (
        <div className="px-6 py-3 text-sm text-slate-500">Waiting for flow from extension…</div>
      )}

      {!isLoaded && !isLoading && !error && (
        <div className="flex flex-1 items-center justify-center p-8">
          <div className="max-w-md rounded-xl border border-slate-200 bg-white p-6 text-center shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">No flow loaded</h2>
            <p className="mt-2 text-sm text-slate-600">
              Record steps with the Peacock extension, then stop recording to open this editor.
            </p>
            <Link
              to="/"
              className="mt-4 inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
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
