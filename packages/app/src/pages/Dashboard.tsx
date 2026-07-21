import { FileText, Map } from 'lucide-react';
import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { DeleteDocumentConfirmContent } from '@/components/dashboard/DeleteDocumentConfirmContent';
import { DeleteProductTourConfirmContent } from '@/components/dashboard/DeleteProductTourConfirmContent';
import { DashboardHero } from '@/components/dashboard/DashboardHero';
import { DashboardStats } from '@/components/dashboard/DashboardStats';
import { DashboardAnalyticsSection } from '@/components/dashboard/DashboardAnalyticsSection';
import { ExtensionMissingBanner } from '@/components/extension/ExtensionMissingBanner';
import { FlowLibrarySection } from '@/components/dashboard/FlowLibrarySection';
import { ProductTourLibraryCards } from '@/components/dashboard/ProductTourLibraryCards';
import { ViewModeToggle } from '@/components/dashboard/ViewModeToggle';
import { GenericErrorPage } from '@/components/errors/GenericErrorPage';
import { DashboardRecentSection } from '@/components/library/LibraryPageHeader';
import { PeacockStudioLoader } from '@/components/PeacockStudioLoader';
import {
  readDashboardViewMode,
  writeDashboardViewMode,
} from '@/constants/dashboard';
import { getGuestVisibleDocLimit } from '@/cloud/planLimits';
import { FLOW_DOCS_PATH, PRODUCT_TOURS_PATH } from '@/constants/routes';
import { useCloudInitError } from '@/hooks/useCloudInitError';
import { useIsGuestSession, useSessionMode } from '@/hooks/useSessionMode';
import { useFlowLibrary } from '@/hooks/useFlowLibrary';
import { useProductTourLibrary } from '@/hooks/useProductTourLibrary';
import { LibraryLayout } from '@/layouts/LibraryLayout';
import type { ProductTourSummary } from '@/types/productTour';
import type { DashboardViewMode, SavedFlowSummary } from '@/types/savedFlow';
import { sortSummaries } from '@/utils/dashboardLibrary';
import { filterGuestVisibleSummaries } from '@/utils/guestDocumentVisibility';
import { computeDashboardStats } from '@/utils/dashboardStats';

const RECENT_LIMIT = 5;

export const Dashboard = () => {
  const sessionMode = useSessionMode();
  const isGuest = useIsGuestSession();
  const cloudInitError = useCloudInitError();
  const { summaries: allSummaries, isLoading, error, deleteDocument } = useFlowLibrary();
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

  return (
    <LibraryLayout>
      <ExtensionMissingBanner />
      {sessionMode === 'connecting' ? (
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
      ) : (
        <div className="flex-1">
          <DashboardHero />

          <div className="relative z-10 mx-auto w-full max-w-8xl px-4 pb-12 sm:px-6 lg:px-8">
            <div className="-mt-14 space-y-8">
              <DashboardStats stats={stats} />

              <DashboardAnalyticsSection documentCount={stats.totalDocuments} />

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
                    <p className="py-6 text-center text-sm text-slate-500">No product tours yet.</p>
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
                    <p className="py-6 text-center text-sm text-slate-500">No flow docs yet.</p>
                  ) : (
                    <FlowLibrarySection
                      viewMode={flowDocsViewMode}
                      summaries={recentFlowDocs}
                      onRequestDelete={setPendingDocDelete}
                    />
                  )}
                </DashboardRecentSection>
              </motion.div>
            </div>
          </div>
        </div>
      )}

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
    </LibraryLayout>
  );
};
