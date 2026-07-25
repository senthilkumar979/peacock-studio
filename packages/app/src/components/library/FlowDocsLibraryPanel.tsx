import { FileText, SearchX } from 'lucide-react';
import { useMemo, useState } from 'react';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { DeleteDocumentConfirmContent } from '@/components/dashboard/DeleteDocumentConfirmContent';
import { FlowLibrarySection } from '@/components/dashboard/FlowLibrarySection';
import { GuestLibraryHiddenNotice } from '@/components/dashboard/GuestLibraryHiddenNotice';
import { FlowDocsLibraryToolbar } from '@/components/library/FlowDocsLibraryToolbar';
import { LibraryGuideInfoButton } from '@/components/library/LibraryGuideInfoButton';
import { LibraryGuideReveal } from '@/components/library/LibraryGuideSection';
import { SmoothLoadReveal } from '@/components/motion/SmoothLoadReveal';
import { GenericErrorPage } from '@/components/errors/GenericErrorPage';
import { PeacockStudioLoader } from '@/components/PeacockStudioLoader';
import {
  readDashboardViewMode,
  writeDashboardViewMode,
} from '@/constants/dashboard';
import { LIBRARY_GUIDE_IDS } from '@/constants/libraryGuideContent';
import { getGuestVisibleDocLimit } from '@/cloud/planLimits';
import { useLibraryGuidePanel } from '@/hooks/useLibraryGuidePanel';
import { useIsGuestSession } from '@/hooks/useSessionMode';
import { useFlowLibrary } from '@/hooks/useFlowLibrary';
import type { DashboardViewMode, SavedFlowSummary } from '@/types/savedFlow';
import {
  filterSummaries,
  sortSummaries,
  type DashboardSortMode,
  type DashboardStatusFilter,
} from '@/utils/dashboardLibrary';
import { filterGuestVisibleSummaries } from '@/utils/guestDocumentVisibility';

export const FlowDocsLibraryPanel = () => {
  const isGuest = useIsGuestSession();
  const { summaries: allSummaries, isLoading, error, deleteDocument, duplicateDocument, refresh } =
    useFlowLibrary();
  const [viewMode, setViewMode] = useState<DashboardViewMode>(readDashboardViewMode);
  const [sortMode, setSortMode] = useState<DashboardSortMode>('newest');
  const [statusFilter, setStatusFilter] = useState<DashboardStatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [pendingDelete, setPendingDelete] = useState<SavedFlowSummary | null>(null);

  const summaries = useMemo(() => {
    if (!isGuest) return allSummaries;
    return filterGuestVisibleSummaries(allSummaries, getGuestVisibleDocLimit());
  }, [allSummaries, isGuest]);

  const displayedSummaries = useMemo(
    () => sortSummaries(filterSummaries(summaries, searchQuery, statusFilter), sortMode),
    [summaries, searchQuery, statusFilter, sortMode],
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

  const hasItems = summaries.length > 0;
  const { showGuide, showGuideToggle, isGuideOpen, toggleGuide } = useLibraryGuidePanel(hasItems);

  return (
    <>
      <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xl shadow-slate-200/60">
        <div className="border-b border-slate-100 px-5 py-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900">
                <FileText className="h-6 w-6 text-peacock-600" aria-hidden />
                Flow Docs
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Every flow you record with the Peacock extension — open, edit, share, or export any
                guide.
              </p>
              <p className="mt-4 text-sm text-slate-500">{libraryCountLabel}</p>
            </div>
            {showGuideToggle ? (
              <LibraryGuideInfoButton isOpen={isGuideOpen} onClick={toggleGuide} />
            ) : null}
          </div>
        </div>

        {error ? (
          <div className="mx-6 mb-6">
            <GenericErrorPage compact onRetry={() => void refresh()} />
          </div>
        ) : (
          <SmoothLoadReveal
            isLoading={isLoading}
            loading={
              <div className="flex flex-col items-center justify-center gap-4 px-6 py-20">
                <PeacockStudioLoader size={120} />
                <p className="text-sm font-medium text-slate-500">Loading your library…</p>
              </div>
            }
          >
            <LibraryGuideReveal
              show={showGuide}
              guideId={LIBRARY_GUIDE_IDS.flowDocs}
              className="mx-6 mb-6 mt-5"
            />

            {summaries.length > 0 ? (
              <FlowDocsLibraryToolbar
                searchQuery={searchQuery}
                sortMode={sortMode}
                statusFilter={statusFilter}
                viewMode={viewMode}
                onSearchChange={setSearchQuery}
                onSortChange={setSortMode}
                onStatusFilterChange={setStatusFilter}
                onViewChange={handleViewChange}
              />
            ) : null}

            {isGuest && allSummaries.length > summaries.length ? (
              <GuestLibraryHiddenNotice
                visibleCount={summaries.length}
                totalCount={allSummaries.length}
              />
            ) : null}

            {summaries.length > 0 && displayedSummaries.length === 0 ? (
              <div className="mx-6 mb-6 rounded-xl border border-slate-200 bg-slate-50 px-6 py-10 text-center">
                <SearchX className="mx-auto h-10 w-10 text-slate-300" aria-hidden />
                <p className="mt-3 font-semibold text-slate-900">No matches found</p>
                <p className="mt-2 text-sm text-slate-600">
                  Try a different search term or clear the filter to see all documentations.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('all');
                  }}
                  className="mt-4 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Clear filters
                </button>
              </div>
            ) : null}

            {displayedSummaries.length > 0 ? (
              <div className="p-6 pt-2">
                <FlowLibrarySection
                  viewMode={viewMode}
                  summaries={displayedSummaries}
                  onRequestDelete={setPendingDelete}
                  onRequestDuplicate={(summary) => {
                    void duplicateDocument(summary.id);
                  }}
                />
              </div>
            ) : null}
          </SmoothLoadReveal>
        )}
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
