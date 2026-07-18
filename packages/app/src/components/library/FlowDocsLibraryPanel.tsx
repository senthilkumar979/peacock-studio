import { FileText, SearchX } from 'lucide-react';
import { useMemo, useState } from 'react';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { DeleteDocumentConfirmContent } from '@/components/dashboard/DeleteDocumentConfirmContent';
import { DashboardEmptyState } from '@/components/dashboard/DashboardEmptyState';
import { FlowLibrarySection } from '@/components/dashboard/FlowLibrarySection';
import { GuestLibraryHiddenNotice } from '@/components/dashboard/GuestLibraryHiddenNotice';
import { FlowDocsLibraryToolbar } from '@/components/library/FlowDocsLibraryToolbar';
import { GenericErrorPage } from '@/components/errors/GenericErrorPage';
import { PeacockStudioLoader } from '@/components/PeacockStudioLoader';
import {
  readDashboardViewMode,
  writeDashboardViewMode,
} from '@/constants/dashboard';
import { getGuestVisibleDocLimit } from '@/cloud/planLimits';
import { useIsGuestSession } from '@/hooks/useSessionMode';
import { useFlowLibrary } from '@/hooks/useFlowLibrary';
import type { DashboardViewMode, SavedFlowSummary } from '@/types/savedFlow';
import {
  filterSummaries,
  sortSummaries,
  type DashboardSortMode,
} from '@/utils/dashboardLibrary';
import { filterGuestVisibleSummaries } from '@/utils/guestDocumentVisibility';

export const FlowDocsLibraryPanel = () => {
  const isGuest = useIsGuestSession();
  const { summaries: allSummaries, isLoading, error, deleteDocument, refresh } =
    useFlowLibrary();
  const [viewMode, setViewMode] = useState<DashboardViewMode>(readDashboardViewMode);
  const [sortMode, setSortMode] = useState<DashboardSortMode>('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [pendingDelete, setPendingDelete] = useState<SavedFlowSummary | null>(null);

  const summaries = useMemo(() => {
    if (!isGuest) return allSummaries;
    return filterGuestVisibleSummaries(allSummaries, getGuestVisibleDocLimit());
  }, [allSummaries, isGuest]);

  const displayedSummaries = useMemo(
    () => sortSummaries(filterSummaries(summaries, searchQuery), sortMode),
    [summaries, searchQuery, sortMode],
  );

  const handleViewChange = (mode: DashboardViewMode) => {
    setViewMode(mode);
    writeDashboardViewMode(mode);
  };

  const handleConfirmDelete = () => {
    if (!pendingDelete) return;
    void deleteDocument(pendingDelete.id).finally(() => setPendingDelete(null));
  };

  const libraryCountLabel = useMemo(() => {
    if (isGuest && allSummaries.length > summaries.length) {
      return `Showing ${summaries.length} of ${allSummaries.length} documentations on device`;
    }
    const count = summaries.length;
    return `${count} documentation${count === 1 ? '' : 's'} in your library`;
  }, [allSummaries.length, isGuest, summaries.length]);

  return (
    <>
      <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xl shadow-slate-200/60">
        <div className="border-b border-slate-100 px-5 py-5">
          <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900">
            <FileText className="h-6 w-6 text-peacock-600" aria-hidden />
            Flow Docs
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Every flow you record with the Peacock extension — open, edit, share, or export any guide.
          </p>
          <p className="mt-4 text-sm text-slate-500">{libraryCountLabel}</p>
        </div>

        {!isLoading && !error && summaries.length > 0 ? (
          <FlowDocsLibraryToolbar
            searchQuery={searchQuery}
            sortMode={sortMode}
            viewMode={viewMode}
            onSearchChange={setSearchQuery}
            onSortChange={setSortMode}
            onViewChange={handleViewChange}
          />
        ) : null}

        {isGuest && allSummaries.length > summaries.length ? (
          <GuestLibraryHiddenNotice
            visibleCount={summaries.length}
            totalCount={allSummaries.length}
          />
        ) : null}

        {isLoading ? (
          <div className="flex flex-col items-center justify-center gap-4 px-6 py-20">
            <PeacockStudioLoader size={120} />
            <p className="text-sm font-medium text-slate-500">Loading your library…</p>
          </div>
        ) : null}

        {error ? (
          <div className="mx-6 mb-6">
            <GenericErrorPage compact onRetry={() => void refresh()} />
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
      </section>

      <ConfirmDialog
        isOpen={Boolean(pendingDelete)}
        title="Delete documentation?"
        confirmLabel="Delete"
        isDestructive
        onConfirm={handleConfirmDelete}
        onCancel={() => setPendingDelete(null)}
      >
        {pendingDelete ? (
          <DeleteDocumentConfirmContent
            title={pendingDelete.title}
            stepCount={pendingDelete.stepCount}
          />
        ) : null}
      </ConfirmDialog>
    </>
  );
};
