import { useMemo } from 'react';
import { Plus } from 'lucide-react';
import { useProductTourBuilderStore, getSortedFeatures } from '@/store/productTourBuilderStore';
import type { SavedFlowSummary } from '@/types/savedFlow';
import { ProductTourPersonaSection } from './ProductTourPersonaSection';
import { TourFeatureCard } from './TourFeatureCard';

interface ProductTourFeatureListProps {
  summaries: SavedFlowSummary[];
}

export const ProductTourFeatureList = ({ summaries }: ProductTourFeatureListProps) => {
  const tour = useProductTourBuilderStore((state) => state.tour);
  const addFeature = useProductTourBuilderStore((state) => state.addFeature);
  const updateTourDetails = useProductTourBuilderStore((state) => state.updateTourDetails);

  const summariesById = useMemo(
    () => new Map(summaries.map((summary) => [summary.id, summary])),
    [summaries],
  );

  if (!tour) return null;

  const features = getSortedFeatures(tour);

  return (
    <div className="space-y-4">
      <ProductTourPersonaSection />

      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <label className="block text-sm">
          <span className="font-medium text-slate-700">Tour title</span>
          <input
            value={tour.title}
            onChange={(event) => updateTourDetails(event.target.value, tour.description)}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold"
          />
        </label>
        <label className="mt-3 block text-sm">
          <span className="font-medium text-slate-700">Tour description</span>
          <textarea
            value={tour.description}
            onChange={(event) => updateTourDetails(tour.title, event.target.value)}
            rows={3}
            className="mt-1 w-full resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
        </label>
      </section>

      <div className="px-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Features ({features.length})
        </p>
      </div>

      <ol className="space-y-4">
        {features.map((feature, index) => (
          <li key={feature.id}>
            <TourFeatureCard
              feature={feature}
              featureNumber={index + 1}
              summaries={summaries}
              summariesById={summariesById}
              canDelete={features.length > 1}
            />
          </li>
        ))}
      </ol>

      <button
        type="button"
        onClick={addFeature}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-white px-4 py-4 text-sm font-medium text-slate-700 hover:border-peacock-200 hover:bg-peacock-50/40"
      >
        <Plus className="h-4 w-4" aria-hidden />
        Add feature
      </button>
    </div>
  );
};
