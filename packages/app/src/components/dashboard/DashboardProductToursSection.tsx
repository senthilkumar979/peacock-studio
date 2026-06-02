import { Plus, Map } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PeacockStudioLoader } from '@/components/PeacockStudioLoader';
import type { ProductTourSummary } from '@/types/productTour';
import { ProductTourLibraryCards } from './ProductTourLibraryCards';

interface DashboardProductToursSectionProps {
  summaries: ProductTourSummary[];
  isLoading: boolean;
  error: string | null;
  onRequestDelete: (summary: ProductTourSummary) => void;
}

export const DashboardProductToursSection = ({
  summaries,
  isLoading,
  error,
  onRequestDelete,
}: DashboardProductToursSectionProps) => (
  <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xl shadow-slate-200/60">
    <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
          <Map className="h-5 w-5 text-brand-violet" aria-hidden />
          Product Tours
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Multi-demo tours organized by persona and feature for product education.
        </p>
      </div>
      <Link
        to="/tours/new"
        className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-violet to-peacock-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-brand-violet/25 transition hover:brightness-105"
      >
        <Plus className="h-4 w-4" aria-hidden />
        Create tour
      </Link>
    </div>

    {isLoading ? (
      <div className="flex flex-col items-center justify-center gap-4 px-6 py-16">
        <PeacockStudioLoader size={96} />
        <p className="text-sm text-slate-500">Loading product tours…</p>
      </div>
    ) : null}

    {error ? (
      <div className="mx-6 my-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        {error}
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
          to="/tours/new"
          className="mt-4 inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          <Plus className="h-4 w-4" aria-hidden />
          Create your first tour
        </Link>
      </div>
    ) : null}

    {!isLoading && !error && summaries.length > 0 ? (
      <div className="p-6 pt-2">
        <ProductTourLibraryCards summaries={summaries} onRequestDelete={onRequestDelete} />
      </div>
    ) : null}
  </section>
);
