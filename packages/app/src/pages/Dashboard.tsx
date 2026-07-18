import { SearchX } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { AppFooter } from "@/components/AppFooter";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { DeleteDocumentConfirmContent } from "@/components/dashboard/DeleteDocumentConfirmContent";
import { DeleteProductTourConfirmContent } from "@/components/dashboard/DeleteProductTourConfirmContent";
import { DashboardEmptyState } from "@/components/dashboard/DashboardEmptyState";
import { DashboardFeaturedDoc } from "@/components/dashboard/DashboardFeaturedDoc";
import { DashboardHero } from "@/components/dashboard/DashboardHero";
import { GuestLibraryHiddenNotice } from "@/components/dashboard/GuestLibraryHiddenNotice";
import { DashboardLibraryToolbar } from "@/components/dashboard/DashboardLibraryToolbar";
import { DashboardProductToursSection } from "@/components/dashboard/DashboardProductToursSection";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { FlowLibrarySection } from "@/components/dashboard/FlowLibrarySection";
import { PeacockStudioLoader } from "@/components/PeacockStudioLoader";
import {
  readDashboardViewMode,
  writeDashboardViewMode,
} from "@/constants/dashboard";
import { getGuestVisibleDocLimit } from "@/cloud/planLimits";
import { useCloudInitError } from "@/hooks/useCloudInitError";
import { useIsGuestSession, useSessionMode } from "@/hooks/useSessionMode";
import { useFlowLibrary } from "@/hooks/useFlowLibrary";
import { useProductTourLibrary } from "@/hooks/useProductTourLibrary";
import type { DashboardViewMode, SavedFlowSummary } from "@/types/savedFlow";
import type { ProductTourSummary } from "@/types/productTour";
import {
  filterSummaries,
  sortSummaries,
  type DashboardSortMode,
} from "@/utils/dashboardLibrary";
import { filterGuestVisibleSummaries } from "@/utils/guestDocumentVisibility";
import { computeDashboardStats } from "@/utils/dashboardStats";
import { DASHBOARD_HINT_IDS, DASHBOARD_HINT_SEQUENCE, getHintStepLabel } from "@/constants/firstTimeHints";
import { isGuestLibraryIntroDismissed } from "@/constants/guestLibraryIntro";
import { useDashboardFirstTimeHint } from "@/hooks/useFirstTimeHint";

export const Dashboard = () => {
  const sessionMode = useSessionMode();
  const isGuest = useIsGuestSession();
  const cloudInitError = useCloudInitError();
  const { summaries: allSummaries, isLoading, error, deleteDocument } =
    useFlowLibrary();
  const {
    summaries: tourSummaries,
    isLoading: isToursLoading,
    error: toursError,
    deleteTourById,
  } = useProductTourLibrary();
  const [viewMode, setViewMode] = useState<DashboardViewMode>(
    readDashboardViewMode,
  );
  const [sortMode, setSortMode] = useState<DashboardSortMode>("newest");
  const [searchQuery, setSearchQuery] = useState("");
  const [pendingDelete, setPendingDelete] = useState<SavedFlowSummary | null>(
    null,
  );
  const [pendingTourDelete, setPendingTourDelete] =
    useState<ProductTourSummary | null>(null);
  const [guestIntroSettled, setGuestIntroSettled] = useState(true);

  const summaries = useMemo(() => {
    if (!isGuest) return allSummaries;
    return filterGuestVisibleSummaries(allSummaries, getGuestVisibleDocLimit());
  }, [allSummaries, isGuest]);

  const stats = useMemo(() => computeDashboardStats(summaries), [summaries]);

  const displayedSummaries = useMemo(
    () => sortSummaries(filterSummaries(summaries, searchQuery), sortMode),
    [summaries, searchQuery, sortMode],
  );

  const latestSummary = useMemo(() => {
    if (summaries.length === 0) return null;
    return sortSummaries(summaries, "newest")[0] ?? null;
  }, [summaries]);

  useEffect(() => {
    const hasHiddenGuestDocs = isGuest && allSummaries.length > summaries.length;
    if (!hasHiddenGuestDocs) {
      setGuestIntroSettled(true);
      return;
    }
    setGuestIntroSettled(isGuestLibraryIntroDismissed());
  }, [allSummaries.length, isGuest, summaries.length]);

  const handleViewChange = (mode: DashboardViewMode) => {
    setViewMode(mode);
    writeDashboardViewMode(mode);
  };

  const handleConfirmDelete = () => {
    if (!pendingDelete) return;
    void deleteDocument(pendingDelete.id).finally(() => setPendingDelete(null));
  };

  const handleConfirmTourDelete = () => {
    if (!pendingTourDelete) return;
    void deleteTourById(pendingTourDelete.id).finally(() =>
      setPendingTourDelete(null),
    );
  };

  const { activeHintId, dismissHint } = useDashboardFirstTimeHint({
    isLibraryLoading: isLoading,
    hasDocuments: allSummaries.length > 0,
    enabled: guestIntroSettled,
  });

  const hintStepLabel = (hintId: string) => getHintStepLabel(hintId, DASHBOARD_HINT_SEQUENCE);

  return (
    <div className="flex min-h-screen flex-col bg-slate-100/80">
      {sessionMode === 'connecting' ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-24 text-center">
          {cloudInitError ? (
            <>
              <p className="max-w-lg text-sm font-medium text-red-700">{cloudInitError}</p>
              <p className="max-w-lg text-xs text-slate-500">
                Clerk setup:{' '}
                <a
                  href="https://dashboard.clerk.com/setup/supabase"
                  className="font-medium text-peacock-700 underline"
                  target="_blank"
                  rel="noreferrer"
                >
                  Activate Supabase integration
                </a>
                . Supabase: Authentication → Third-party → add Clerk with your Clerk domain.
              </p>
            </>
          ) : (
            <>
              <PeacockStudioLoader size={120} />
              <p className="text-sm text-slate-500">Connecting your cloud library…</p>
            </>
          )}
        </div>
      ) : (
      <>
      <div className="flex-1">
        <DashboardHero stats={stats} documentCount={summaries.length} />

        <div className="relative z-10 mx-auto w-full max-w-8xl px-28 pb-12">
          <div className="-mt-14 space-y-8">
            <DashboardStats stats={stats} />

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.15 }}
            >
              <DashboardProductToursSection
                summaries={tourSummaries}
                isLoading={isToursLoading}
                error={toursError}
                showProductToursHint={activeHintId === DASHBOARD_HINT_IDS.productTours}
                onDismissProductToursHint={() =>
                  dismissHint(DASHBOARD_HINT_IDS.productTours)
                }
                productToursHintStep={hintStepLabel(DASHBOARD_HINT_IDS.productTours)}
                onRequestDelete={setPendingTourDelete}
              />
            </motion.div>

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
                guestTotalCount={isGuest ? allSummaries.length : undefined}
                showLibraryHint={activeHintId === DASHBOARD_HINT_IDS.library}
                onDismissLibraryHint={() => dismissHint(DASHBOARD_HINT_IDS.library)}
                libraryHintStep={hintStepLabel(DASHBOARD_HINT_IDS.library)}
                onSearchChange={setSearchQuery}
                onSortChange={setSortMode}
                onViewChange={handleViewChange}
              />

              {isGuest && allSummaries.length > summaries.length ? (
                <GuestLibraryHiddenNotice
                  visibleCount={summaries.length}
                  totalCount={allSummaries.length}
                  onIntroSettled={() => setGuestIntroSettled(true)}
                />
              ) : null}

              {isLoading ? (
                <div className="flex flex-col items-center justify-center gap-4 px-6 py-20">
                  <PeacockStudioLoader size={120} />
                  <p className="text-sm font-medium text-slate-500">
                    Loading your library…
                  </p>
                </div>
              ) : null}

              {error ? (
                <div className="mx-6 mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                  {error}
                </div>
              ) : null}

              {!isLoading && !error && summaries.length === 0 ? (
                <DashboardEmptyState
                  showRecordHint={activeHintId === DASHBOARD_HINT_IDS.recordFlow}
                  onDismissRecordHint={() => dismissHint(DASHBOARD_HINT_IDS.recordFlow)}
                />
              ) : null}

              {!isLoading &&
              !error &&
              summaries.length > 0 &&
              displayedSummaries.length === 0 ? (
                <div className="mx-6 mb-6 rounded-xl border border-slate-200 bg-slate-50 px-6 py-10 text-center">
                  <SearchX
                    className="mx-auto h-10 w-10 text-slate-300"
                    aria-hidden
                  />
                  <p className="mt-3 font-semibold text-slate-900">
                    No matches found
                  </p>
                  <p className="mt-2 text-sm text-slate-600">
                    Try a different search term or clear the filter to see all
                    documentations.
                  </p>
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
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
      </div>

      <AppFooter />
      </>
      )}

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
      <ConfirmDialog
        isOpen={Boolean(pendingTourDelete)}
        title="Delete product tour?"
        confirmLabel="Delete"
        isDestructive
        onConfirm={handleConfirmTourDelete}
        onCancel={() => setPendingTourDelete(null)}
      >
        {pendingTourDelete ? (
          <DeleteProductTourConfirmContent
            title={pendingTourDelete.title}
            featureCount={pendingTourDelete.featureCount}
            demoCount={pendingTourDelete.demoCount}
          />
        ) : null}
      </ConfirmDialog>
    </div>
  );
};
