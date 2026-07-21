import { Plus, Map } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { DeleteProductTourConfirmContent } from '@/components/dashboard/DeleteProductTourConfirmContent';
import { ProductTourLibraryCards } from '@/components/dashboard/ProductTourLibraryCards';
import { GenericErrorPage } from '@/components/errors/GenericErrorPage';
import { PeacockStudioLoader } from '@/components/PeacockStudioLoader';
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

  return (
    <>
      <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xl shadow-slate-200/60">
        <div className="border-b border-slate-100 px-5 py-5">
          <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900">
            <Map className="h-6 w-6 text-brand-violet" aria-hidden />
            Product Tours
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Multi-demo tours organized by persona and feature for product education.
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-slate-500">
              {summaries.length} tour{summaries.length === 1 ? '' : 's'} in your library
            </p>
            <Link
              to={getExtensionGatePath("/tours/new")}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-violet to-peacock-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-brand-violet/25 transition hover:brightness-105"
            >
              <Plus className="h-4 w-4" aria-hidden />
              Create tour
            </Link>
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center gap-4 px-6 py-16">
            <PeacockStudioLoader size={96} />
            <p className="text-sm text-slate-500">Loading product tours…</p>
          </div>
        ) : null}

        {error ? (
          <div className="mx-6 my-6">
            <GenericErrorPage compact onRetry={() => void refresh()} />
          </div>
        ) : null}

        {!isLoading && !error && summaries.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <Map className="mx-auto h-10 w-10 text-slate-300" aria-hidden />
            <p className="mt-3 font-semibold text-slate-900">No product tours yet</p>
            <p className="mt-2 text-sm text-slate-600">
              Build a persona-led tour with features and linked demos.
            </p>
            <Link
              to={getExtensionGatePath("/tours/new")}
              className="mt-4 inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <Plus className="h-4 w-4" aria-hidden />
              Create your first tour
            </Link>
          </div>
        ) : null}

        {!isLoading && !error && summaries.length > 0 ? (
          <div className="p-6 pt-2">
            <ProductTourLibraryCards summaries={summaries} onRequestDelete={setPendingTourDelete} />
          </div>
        ) : null}
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
