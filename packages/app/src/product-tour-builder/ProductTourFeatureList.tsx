import { useMemo } from "react";
import { ClipboardList, Layers3, Plus, Sparkles } from "lucide-react";
import {
  useProductTourBuilderStore,
  getSortedFeatures,
} from "@/store/productTourBuilderStore";
import type { SavedFlowSummary } from "@/types/savedFlow";
import { FieldInput, FieldTextarea, FormField } from "@/components/ui";
import { ProductTourPersonaSection } from "./ProductTourPersonaSection";
import { TourFeatureCard } from "./TourFeatureCard";
import { HintAnchor, type PageHintControl } from "@/components/onboarding/HintAnchor";
import { PRODUCT_TOUR_HINT_IDS } from "@/constants/firstTimeHints";

interface ProductTourFeatureListProps {
  summaries: SavedFlowSummary[];
  pageHints?: PageHintControl;
}

export const ProductTourFeatureList = ({
  summaries,
  pageHints,
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
      <ProductTourPersonaSection pageHints={pageHints} />

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg shadow-slate-200/60">
        <div className="border-b border-slate-100 bg-gradient-to-br from-slate-50 via-white to-brand-violet/5 px-5 py-4 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <HintAnchor
              hints={pageHints}
              hintId={PRODUCT_TOUR_HINT_IDS.details}
              title="Tour details"
              description="Set the title and description shown on preview cards and when you share this product tour."
            >
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                  Product tour details
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Keep this concise. This appears in preview and share cards.
                </p>
              </div>
            </HintAnchor>
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
        </div>

        <div className="space-y-4 px-5 py-5 sm:px-6">
          <FormField label="Tour title">
            <FieldInput
              value={tour.title}
              onChange={(event) =>
                updateTourDetails(event.target.value, tour.description)
              }
              className="font-semibold text-slate-900"
            />
          </FormField>
          <FormField label="Tour description">
            <FieldTextarea
              value={tour.description}
              onChange={(event) =>
                updateTourDetails(tour.title, event.target.value)
              }
              rows={4}
              className="text-slate-700"
            />
          </FormField>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-lg shadow-slate-200/60">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <HintAnchor
            hints={pageHints}
            hintId={PRODUCT_TOUR_HINT_IDS.features}
            title="Features & demos"
            description="Group flow documents into features, then link demos learners will walk through in order."
          >
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                Features
              </p>
              <p className="mt-1 text-sm font-medium text-slate-500">
                Structure the tour as clear, digestible capabilities.
              </p>
            </div>
          </HintAnchor>
          <div className="flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5">
            <ClipboardList className="h-4 w-4 text-slate-500" aria-hidden />
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
              {features.length} total
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

        <HintAnchor
          hints={pageHints}
          hintId={PRODUCT_TOUR_HINT_IDS.addFeature}
          title="Add a feature"
          description="Each feature groups related demos. Add more as your product tour grows."
          placement="top"
        >
          <button
            type="button"
            onClick={addFeature}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-peacock-300 bg-peacock-50/40 px-4 py-4 text-sm font-semibold text-peacock-800 transition hover:bg-peacock-50"
          >
            <Plus className="h-4 w-4" aria-hidden />
            Add feature
          </button>
        </HintAnchor>
      </section>
    </div>
  );
};
