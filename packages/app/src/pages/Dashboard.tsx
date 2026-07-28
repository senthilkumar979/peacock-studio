import { FileText, Map } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { DeleteDocumentConfirmContent } from '@/components/dashboard/DeleteDocumentConfirmContent';
import { DeleteProductTourConfirmContent } from '@/components/dashboard/DeleteProductTourConfirmContent';
import { DashboardEmptyState } from '@/components/dashboard/DashboardEmptyState';
import { DashboardHero } from '@/components/dashboard/DashboardHero';
import { DashboardStats } from '@/components/dashboard/DashboardStats';
import { DashboardAnalyticsSection } from '@/components/dashboard/DashboardAnalyticsSection';
import { ExtensionMissingBanner } from '@/components/extension/ExtensionMissingBanner';
import { FlowLibrarySection } from '@/components/dashboard/FlowLibrarySection';
import { GuestLibraryHiddenNotice } from '@/components/dashboard/GuestLibraryHiddenNotice';
import { GuestLibraryIntroModal } from '@/components/dashboard/GuestLibraryIntroModal';
import { LibraryEmptyCta } from '@/components/dashboard/LibraryEmptyCta';
import { ProductTourLibraryCards } from '@/components/dashboard/ProductTourLibraryCards';
import { ViewModeToggle } from '@/components/dashboard/ViewModeToggle';
import { GenericErrorPage } from '@/components/errors/GenericErrorPage';
import { DashboardRecentSection } from '@/components/library/LibraryPageHeader';
import { PeacockStudioLoader } from '@/components/PeacockStudioLoader';
import { isCloudSyncEnabled } from '@/cloud/config';
import { getGuestVisibleDocLimit } from '@/cloud/planLimits';
import {
  readDashboardViewMode,
  writeDashboardViewMode,
} from '@/constants/dashboard';
import {
  DASHBOARD_HINT_IDS,
  DASHBOARD_HINT_SEQUENCE,
  getHintStepLabel,
} from '@/constants/firstTimeHints';
import {
  dismissGuestLibraryIntro,
  isGuestLibraryIntroDismissed,
} from '@/constants/guestLibraryIntro';
import { FLOW_DOCS_PATH, PRODUCT_TOURS_PATH } from '@/constants/routes';
import { useCloudInitError } from '@/hooks/useCloudInitError';
import { useDashboardFirstTimeHint } from '@/hooks/useFirstTimeHint';
import { useIsGuestSession, useSessionMode } from '@/hooks/useSessionMode';
import { useFlowLibrary } from '@/hooks/useFlowLibrary';
import { useProductTourLibrary } from '@/hooks/useProductTourLibrary';
import { SmoothLoadReveal } from '@/components/motion/SmoothLoadReveal';
import type { ProductTourSummary } from '@/types/productTour';
import type { DashboardViewMode, SavedFlowSummary } from '@/types/savedFlow';
import { sortSummaries } from '@/utils/dashboardLibrary';
import { filterGuestVisibleSummaries } from '@/utils/guestDocumentVisibility';
import { computeDashboardStats } from '@/utils/dashboardStats';
import { getExtensionGatePath } from '@/utils/extensionGate';

const RECENT_LIMIT = 5;

export const Dashboard = () => {
  const sessionMode = useSessionMode();
  const isGuest = useIsGuestSession();
  const cloudInitError = useCloudInitError();
  const { summaries: allSummaries, isLoading, error, deleteDocument, duplicateDocument } =
    useFlowLibrary();
  const {
    summaries: tourSummaries,
    isLoading: isToursLoading,
    error: toursError,
    deleteTourById,
  } = useProductTourLibrary();
  const [pendingTourDelete, setPendingTourDelete] =
    useState<ProductTourSummary | null>(null);
  const [pendingDocDelete, setPendingDocDelete] = useState<SavedFlowSummary | null>(null);
  const [flowDocsViewMode, setFlowDocsViewMode] = useState<DashboardViewMode>(readDashboardViewMode);
  const [guestPreviewIntroOpen, setGuestPreviewIntroOpen] = useState(false);

  const summaries = useMemo(() => {
    if (!isGuest) return allSummaries;
    return filterGuestVisibleSummaries(allSummaries, getGuestVisibleDocLimit());
  }, [allSummaries, isGuest]);

  const stats = useMemo(() => computeDashboardStats(summaries), [summaries]);

  const recentTours = useMemo(
    () => [...tourSummaries].sort((a, b) => b.updatedAt - a.updatedAt).slice(0, RECENT_LIMIT),
    [tourSummaries],
  );

  const recentFlowDocs = useMemo(
    () => sortSummaries(summaries, 'newest').slice(0, RECENT_LIMIT),
    [summaries],
  );

  const libraryReady = !isLoading && !isToursLoading;
  const hasAnyLibraryItems = summaries.length > 0 || tourSummaries.length > 0;
  const showFullEmptyState =
    libraryReady && !error && !toursError && summaries.length === 0 && tourSummaries.length === 0;

  const { activeHintId, dismissHint } = useDashboardFirstTimeHint({
    isLibraryLoading: !libraryReady,
    hasDocuments: hasAnyLibraryItems,
  });

  const guestHasHiddenDocs = isGuest && allSummaries.length > summaries.length;

  useEffect(() => {
    if (!isGuest || isLoading || isGuestLibraryIntroDismissed()) return;
    // Early heads-up when guest has docs but none are hidden yet (or empty library).
    if (allSummaries.length <= getGuestVisibleDocLimit()) {
      setGuestPreviewIntroOpen(true);
    }
  }, [allSummaries.length, isGuest, isLoading]);

  const handleConfirmTourDelete = () => {
    if (!pendingTourDelete) return;
    void deleteTourById(pendingTourDelete.id).finally(() => setPendingTourDelete(null));
  };

  const handleConfirmDocDelete = () => {
    if (!pendingDocDelete) return;
    void deleteDocument(pendingDocDelete.id).finally(() => setPendingDocDelete(null));
  };

  const handleFlowDocsViewChange = (mode: DashboardViewMode) => {
    setFlowDocsViewMode(mode);
    writeDashboardViewMode(mode);
  };

  const handleGuestPreviewDismiss = () => {
    dismissGuestLibraryIntro();
    setGuestPreviewIntroOpen(false);
  };

  return (
    <>
      <ExtensionMissingBanner />
      <SmoothLoadReveal
        isLoading={sessionMode === 'connecting'}
        loading={
          <div className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
            {cloudInitError ? (
              <GenericErrorPage compact onRetry={() => window.location.reload()} />
            ) : (
              <>
                <PeacockStudioLoader size={120} />
                <p className="text-sm text-slate-500">Connecting your cloud library…</p>
              </>
            )}
          </div>
        }
      >
        <div className="flex-1">
          <DashboardHero />

          <div className="relative z-10 mx-auto w-full max-w-8xl px-4 pb-12 sm:px-6 lg:px-8">
            <div className="-mt-14 space-y-8">
              <DashboardStats stats={stats} />

              <DashboardAnalyticsSection documentCount={stats.totalDocuments} />

              {guestHasHiddenDocs ? (
                <GuestLibraryHiddenNotice
                  visibleCount={summaries.length}
                  totalCount={allSummaries.length}
                />
              ) : null}

              {showFullEmptyState ? (
                <DashboardEmptyState
                  showRecordHint={activeHintId === DASHBOARD_HINT_IDS.recordFlow}
                  onDismissRecordHint={() => dismissHint(DASHBOARD_HINT_IDS.recordFlow)}
                  storageHint={
                    isCloudSyncEnabled() && sessionMode === 'cloud' ? 'cloud' : 'local'
                  }
                />
              ) : (
                <>
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, delay: 0.15 }}
                  >
                    <DashboardRecentSection
                      title="Product Tours"
                      description="Your most recently updated persona-led tours."
                      icon={Map}
                      viewAllHref={PRODUCT_TOURS_PATH}
                      tip={{
                        isOpen: activeHintId === DASHBOARD_HINT_IDS.productTours,
                        stepLabel: getHintStepLabel(
                          DASHBOARD_HINT_IDS.productTours,
                          DASHBOARD_HINT_SEQUENCE,
                        ),
                        title: 'Product tours',
                        description:
                          'Combine multiple demos into persona-led tours for onboarding, sales, or feature education.',
                        onDismiss: () => dismissHint(DASHBOARD_HINT_IDS.productTours),
                      }}
                    >
                      {isToursLoading ? (
                        <div className="flex justify-center py-10">
                          <PeacockStudioLoader size={80} />
                        </div>
                      ) : toursError ? (
                        <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                          {toursError}
                        </p>
                      ) : recentTours.length === 0 ? (
                        <LibraryEmptyCta
                          icon={Map}
                          title="No product tours yet"
                          description="Bundle saved demos into a persona-led tour for sales, onboarding, or feature education."
                          primaryHref={getExtensionGatePath('/tours/new')}
                          primaryLabel="Create your first tour"
                        />
                      ) : (
                        <ProductTourLibraryCards
                          summaries={recentTours}
                          onRequestDelete={setPendingTourDelete}
                        />
                      )}
                    </DashboardRecentSection>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, delay: 0.25 }}
                  >
                    <DashboardRecentSection
                      title="Flow Docs"
                      description="Your most recently updated flow documentations."
                      icon={FileText}
                      viewAllHref={FLOW_DOCS_PATH}
                      tip={{
                        isOpen: activeHintId === DASHBOARD_HINT_IDS.library,
                        stepLabel: getHintStepLabel(
                          DASHBOARD_HINT_IDS.library,
                          DASHBOARD_HINT_SEQUENCE,
                        ),
                        title: 'Your flow library',
                        description:
                          'Open, edit, share, or export any guide you record with the Peacock extension.',
                        onDismiss: () => dismissHint(DASHBOARD_HINT_IDS.library),
                      }}
                      toolbar={
                        !isLoading && !error && recentFlowDocs.length > 0 ? (
                          <ViewModeToggle
                            value={flowDocsViewMode}
                            onChange={handleFlowDocsViewChange}
                          />
                        ) : null
                      }
                    >
                      {isLoading ? (
                        <div className="flex justify-center py-10">
                          <PeacockStudioLoader size={80} />
                        </div>
                      ) : error ? (
                        <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                          {error}
                        </p>
                      ) : recentFlowDocs.length === 0 ? (
                        <LibraryEmptyCta
                          icon={FileText}
                          title="No flow docs yet"
                          description="Install the Peacock browser extension, record a flow on any site, then stop to open the editor."
                          showExtensionCta
                        />
                      ) : (
                        <FlowLibrarySection
                          viewMode={flowDocsViewMode}
                          summaries={recentFlowDocs}
                          onRequestDelete={setPendingDocDelete}
                          onRequestDuplicate={(summary) => {
                            void duplicateDocument(summary.id);
                          }}
                        />
                      )}
                    </DashboardRecentSection>
                  </motion.div>
                </>
              )}
            </div>
          </div>
        </div>
      </SmoothLoadReveal>

      {isGuest && !guestHasHiddenDocs ? (
        <GuestLibraryIntroModal
          isOpen={guestPreviewIntroOpen}
          mode="preview"
          visibleCount={summaries.length}
          totalCount={allSummaries.length}
          onClose={handleGuestPreviewDismiss}
        />
      ) : null}

      <ConfirmDialog
        isOpen={Boolean(pendingDocDelete)}
        title="Delete documentation?"
        confirmLabel="Delete"
        isDestructive
        onConfirm={handleConfirmDocDelete}
        onCancel={() => setPendingDocDelete(null)}
      >
        {pendingDocDelete ? (
          <DeleteDocumentConfirmContent
            title={pendingDocDelete.title}
            stepCount={pendingDocDelete.stepCount}
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
    </>
  );
};
