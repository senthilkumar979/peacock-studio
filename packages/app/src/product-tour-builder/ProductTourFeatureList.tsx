import { useMemo } from "react";
import { Layers3, Plus, Sparkles } from "lucide-react";
import {
  useProductTourBuilderStore,
  getSortedFeatures,
} from "@/store/productTourBuilderStore";
import type { SavedFlowSummary } from "@/types/savedFlow";
import { ProductTourPersonaSection } from "./ProductTourPersonaSection";
import { TourFeatureCard } from "./TourFeatureCard";

interface ProductTourFeatureListProps {
  summaries: SavedFlowSummary[];
}

export const ProductTourFeatureList = ({
  summaries,
}: ProductTourFeatureListProps) => {
  const tour = useProductTourBuilderStore((state) => state.tour);
  const addFeature = useProductTourBuilderStore((state) => state.addFeature);
  const updateTourDetails = useProductTourBuilderStore(
    (state) => state.updateTourDetails,
  );

  const summariesById = useMemo(
    () => new Map(summaries.map((summary) => [summary.id, summary])),
    [summaries],
  );

  if (!tour) return null;

  const features = getSortedFeatures(tour);
  const totalDemos = features.reduce(
    (sum, feature) => sum + feature.demos.length,
    0,
  );

  return (
    <div className="space-y-5">
      <ProductTourPersonaSection />

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg shadow-slate-200/60">
        <div className="border-b border-slate-100 bg-gradient-to-br from-slate-50 via-white to-brand-violet/5 px-5 py-4 sm:px-6 flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
            Product tour details
          </p>
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
              <Layers3 className="h-3.5 w-3.5" aria-hidden />
              {features.length} features
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
              <Sparkles className="h-3.5 w-3.5" aria-hidden />
              {totalDemos} demos
            </span>
          </div>
        </div>

        <div className="space-y-4 px-5 py-5 sm:px-6">
          <label className="block text-sm">
            <span className="font-medium text-slate-700">Tour title</span>
            <input
              value={tour.title}
              onChange={(event) =>
                updateTourDetails(event.target.value, tour.description)
              }
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-900 outline-none transition focus:border-peacock-300 focus:ring-2 focus:ring-peacock-500/30"
            />
          </label>
          <label className="block text-sm">
            <span className="font-medium text-slate-700">Tour description</span>
            <textarea
              value={tour.description}
              onChange={(event) =>
                updateTourDetails(tour.title, event.target.value)
              }
              rows={4}
              className="mt-1.5 w-full resize-none rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-700 outline-none transition focus:border-peacock-300 focus:ring-2 focus:ring-peacock-500/30"
            />
          </label>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-lg shadow-slate-200/60">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
              Features
            </p>
            <p className="mt-1 text-sm font-medium text-slate-500">
              Structure the tour as clear, digestible capabilities.
            </p>
          </div>
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
              <Layers3 className="h-3.5 w-3.5" aria-hidden />
              {features.length} features
            </span>
          </div>
        </div>

        <ol className="mt-4 space-y-4">
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
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-peacock-300 bg-peacock-50/40 px-4 py-4 text-sm font-semibold text-peacock-800 transition hover:bg-peacock-50"
        >
          <Plus className="h-4 w-4" aria-hidden />
          Add feature
        </button>
      </section>
    </div>
  );
};
