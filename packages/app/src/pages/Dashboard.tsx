import { SearchX } from 'lucide-react';
import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { DashboardEmptyState } from '@/components/dashboard/DashboardEmptyState';
import { DashboardFeaturedDoc } from '@/components/dashboard/DashboardFeaturedDoc';
import { DashboardHero } from '@/components/dashboard/DashboardHero';
import { DashboardLibraryToolbar } from '@/components/dashboard/DashboardLibraryToolbar';
import { DashboardStats } from '@/components/dashboard/DashboardStats';
import { FlowLibrarySection } from '@/components/dashboard/FlowLibrarySection';
import { PeacockStudioLoader } from '@/components/PeacockStudioLoader';
import { readDashboardViewMode, writeDashboardViewMode } from '@/constants/dashboard';
import { useFlowLibrary } from '@/hooks/useFlowLibrary';
import type { DashboardViewMode, SavedFlowSummary } from '@/types/savedFlow';
import {
  filterSummaries,
  sortSummaries,
  type DashboardSortMode,
} from '@/utils/dashboardLibrary';

export const Dashboard = () => {
  const { summaries, stats, isLoading, error, deleteDocument } = useFlowLibrary();
  const [viewMode, setViewMode] = useState<DashboardViewMode>(readDashboardViewMode);
  const [sortMode, setSortMode] = useState<DashboardSortMode>('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [pendingDelete, setPendingDelete] = useState<SavedFlowSummary | null>(null);

  const displayedSummaries = useMemo(
    () => sortSummaries(filterSummaries(summaries, searchQuery), sortMode),
    [summaries, searchQuery, sortMode]
  );

  const latestSummary = useMemo(() => {
    if (summaries.length === 0) return null;
    return sortSummaries(summaries, 'newest')[0] ?? null;
  }, [summaries]);

  const handleViewChange = (mode: DashboardViewMode) => {
    setViewMode(mode);
    writeDashboardViewMode(mode);
  };

  const handleConfirmDelete = () => {
    if (!pendingDelete) return;
    void deleteDocument(pendingDelete.id).finally(() => setPendingDelete(null));
  };

  return (
    <div className="min-h-screen bg-slate-100/80">
      <DashboardHero stats={stats} documentCount={summaries.length} />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 pb-12">
        <div className="-mt-14 space-y-8">
          <DashboardStats stats={stats} />

          {!isLoading && !error && latestSummary ? (
            <DashboardFeaturedDoc summary={latestSummary} />
          ) : null}

          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.3 }}
            className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xl shadow-slate-200/60"
          >
            <DashboardLibraryToolbar
              searchQuery={searchQuery}
              sortMode={sortMode}
              viewMode={viewMode}
              resultCount={displayedSummaries.length}
              totalCount={summaries.length}
              onSearchChange={setSearchQuery}
              onSortChange={setSortMode}
              onViewChange={handleViewChange}
            />

            {isLoading ? (
              <div className="flex flex-col items-center justify-center gap-4 px-6 py-20">
                <PeacockStudioLoader size={120} />
                <p className="text-sm font-medium text-slate-500">Loading your library…</p>
              </div>
            ) : null}

            {error ? (
              <div className="mx-6 mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                {error}
              </div>
            ) : null}

            {!isLoading && !error && summaries.length === 0 ? <DashboardEmptyState /> : null}

            {!isLoading && !error && summaries.length > 0 && displayedSummaries.length === 0 ? (
              <div className="mx-6 mb-6 rounded-xl border border-slate-200 bg-slate-50 px-6 py-10 text-center">
                <SearchX className="mx-auto h-10 w-10 text-slate-300" aria-hidden />
                <p className="mt-3 font-semibold text-slate-900">No matches found</p>
                <p className="mt-2 text-sm text-slate-600">
                  Try a different search term or clear the filter to see all documentations.
                </p>
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="mt-4 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Clear search
                </button>
              </div>
            ) : null}

            {!isLoading && !error && displayedSummaries.length > 0 ? (
              <div className="p-6 pt-2">
                <FlowLibrarySection
                  viewMode={viewMode}
                  summaries={displayedSummaries}
                  onRequestDelete={setPendingDelete}
                />
              </div>
            ) : null}
          </motion.section>
        </div>
      </div>

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
