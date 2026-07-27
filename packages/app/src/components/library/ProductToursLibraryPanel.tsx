import { Plus, Map } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { DeleteProductTourConfirmContent } from '@/components/dashboard/DeleteProductTourConfirmContent';
import { LibraryEmptyCta } from '@/components/dashboard/LibraryEmptyCta';
import { ProductTourLibraryCards } from '@/components/dashboard/ProductTourLibraryCards';
import { GenericErrorPage } from '@/components/errors/GenericErrorPage';
import { LibraryGuideInfoButton } from '@/components/library/LibraryGuideInfoButton';
import { LibraryGuideReveal } from '@/components/library/LibraryGuideSection';
import { SmoothLoadReveal } from '@/components/motion/SmoothLoadReveal';
import { PeacockStudioLoader } from '@/components/PeacockStudioLoader';
import { LIBRARY_GUIDE_IDS } from '@/constants/libraryGuideContent';
import { useLibraryGuidePanel } from '@/hooks/useLibraryGuidePanel';
import { useProductTourLibrary } from '@/hooks/useProductTourLibrary';
import type { ProductTourSummary } from '@/types/productTour';
import { getExtensionGatePath } from '@/utils/extensionGate';

export const ProductToursLibraryPanel = () => {
  const { summaries, isLoading, error, deleteTourById, refresh } = useProductTourLibrary();
  const [pendingTourDelete, setPendingTourDelete] = useState<ProductTourSummary | null>(null);

  const handleConfirmTourDelete = () => {
    if (!pendingTourDelete) return;
    void deleteTourById(pendingTourDelete.id).finally(() => setPendingTourDelete(null));
  };

  const hasItems = summaries.length > 0;
  const { showGuide, showGuideToggle, isGuideOpen, toggleGuide } = useLibraryGuidePanel(hasItems);

  return (
    <>
      <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xl shadow-slate-200/60">
        <div className="border-b border-slate-100 px-5 py-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900">
                <Map className="h-6 w-6 text-brand-violet" aria-hidden />
                Product Tours
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Multi-demo tours organized by persona and feature for product education.
              </p>
              <p className="mt-4 text-sm text-slate-500">
                {summaries.length} tour{summaries.length === 1 ? '' : 's'} in your library
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {showGuideToggle ? (
                <LibraryGuideInfoButton isOpen={isGuideOpen} onClick={toggleGuide} />
              ) : null}
              <Link
                to={getExtensionGatePath('/tours/new')}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-violet to-peacock-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-brand-violet/25 transition hover:brightness-105"
              >
                <Plus className="h-4 w-4" aria-hidden />
                Create tour
              </Link>
            </div>
          </div>
        </div>

        {error ? (
          <div className="mx-6 my-6">
            <GenericErrorPage compact onRetry={() => void refresh()} />
          </div>
        ) : (
          <SmoothLoadReveal
            isLoading={isLoading}
            loading={
              <div className="flex flex-col items-center justify-center gap-4 px-6 py-16">
                <PeacockStudioLoader size={96} />
                <p className="text-sm text-slate-500">Loading product tours…</p>
              </div>
            }
          >
            <LibraryGuideReveal
              show={showGuide}
              guideId={LIBRARY_GUIDE_IDS.productTours}
              className="mx-6 mb-6 mt-5"
            />

            {summaries.length > 0 ? (
              <div className="p-6 pt-2">
                <ProductTourLibraryCards
                  summaries={summaries}
                  onRequestDelete={setPendingTourDelete}
                />
              </div>
            ) : !isLoading ? (
              <div className="mx-6 mb-6">
                <LibraryEmptyCta
                  icon={Map}
                  title="No product tours yet"
                  description="Bundle saved demos into a persona-led tour for sales, onboarding, or feature education."
                  primaryHref={getExtensionGatePath('/tours/new')}
                  primaryLabel="Create your first tour"
                />
              </div>
            ) : null}
          </SmoothLoadReveal>
        )}
      </section>

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
