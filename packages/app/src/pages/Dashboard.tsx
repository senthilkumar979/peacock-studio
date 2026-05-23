import { useState } from 'react';
import { AppHeader } from '@/components/AppHeader';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { DashboardStats } from '@/components/dashboard/DashboardStats';
import { FlowLibrarySection } from '@/components/dashboard/FlowLibrarySection';
import { ViewModeToggle } from '@/components/dashboard/ViewModeToggle';
import { PeacockStudioLoader } from '@/components/PeacockStudioLoader';
import { PEACOCK_APP_NAME } from '@/constants/branding';
import { readDashboardViewMode, writeDashboardViewMode } from '@/constants/dashboard';
import { useFlowLibrary } from '@/hooks/useFlowLibrary';
import type { DashboardViewMode, SavedFlowSummary } from '@/types/savedFlow';

export const Dashboard = () => {
  const { summaries, stats, isLoading, error, deleteDocument } = useFlowLibrary();
  const [viewMode, setViewMode] = useState<DashboardViewMode>(readDashboardViewMode);
  const [pendingDelete, setPendingDelete] = useState<SavedFlowSummary | null>(null);

  const handleViewChange = (mode: DashboardViewMode) => {
    setViewMode(mode);
    writeDashboardViewMode(mode);
  };

  const handleConfirmDelete = () => {
    if (!pendingDelete) return;
    void deleteDocument(pendingDelete.id).finally(() => setPendingDelete(null));
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <AppHeader
        eyebrow={PEACOCK_APP_NAME}
        title="Documentation library"
        description="Saved flows are stored on this device. Open to play, edit to refine steps."
      />

      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-8 px-6 py-8">
        <DashboardStats stats={stats} />

        <section className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Your documentations</h2>
              <p className="text-sm text-slate-500">
                Record with the extension — new flows are saved here automatically.
              </p>
            </div>
            <ViewModeToggle value={viewMode} onChange={handleViewChange} />
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16">
              <PeacockStudioLoader size={120} />
              <p className="text-sm text-slate-500">Loading library…</p>
            </div>
          ) : null}

          {error ? (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              {error}
            </div>
          ) : null}

          {!isLoading && !error && summaries.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
              <h3 className="text-lg font-semibold text-slate-900">No documentation yet</h3>
              <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">
                Install the Peacock extension, record a flow on any site, and stop recording. Your
                documentation will appear here.
              </p>
            </div>
          ) : null}

          {!isLoading && !error && summaries.length > 0 ? (
            <FlowLibrarySection
              viewMode={viewMode}
              summaries={summaries}
              onRequestDelete={setPendingDelete}
            />
          ) : null}
        </section>
      </main>

      <ConfirmDialog
        isOpen={Boolean(pendingDelete)}
        title="Delete documentation?"
        description={
          pendingDelete
            ? `"${pendingDelete.title}" and all ${pendingDelete.stepCount} steps will be removed from this device. This cannot be undone.`
            : ''
        }
        confirmLabel="Delete"
        isDestructive
        onConfirm={handleConfirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
};
