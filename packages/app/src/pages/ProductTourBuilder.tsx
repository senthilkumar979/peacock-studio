import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import {
  PRODUCT_TOUR_HINT_IDS,
  PRODUCT_TOUR_HINT_SEQUENCE,
  getHintStepLabel,
} from "@/constants/firstTimeHints";
import { useFirstTimeHintTour } from "@/hooks/useFirstTimeHint";
import { ResourceNotFoundPage } from "@/components/errors/ResourceNotFoundPage";
import { PeacockStudioLoader } from "@/components/PeacockStudioLoader";
import { HintAnchor, type PageHintControl } from "@/components/onboarding/HintAnchor";
import { usePersistProductTour } from "@/hooks/usePersistProductTour";
import { useSavedProductTour } from "@/hooks/useSavedProductTour";
import { ProductTourBuilderToolbar } from "@/product-tour-builder/ProductTourBuilderToolbar";
import { ProductTourFeatureList } from "@/product-tour-builder/ProductTourFeatureList";
import { ProductTourOverviewCanvas } from "@/product-tour-builder/ProductTourOverviewCanvas";
import { listFlowSummaries } from "@/services/flowLibraryService";
import { useProductTourBuilderStore } from "@/store/productTourBuilderStore";
import type { SavedFlowSummary } from "@/types/savedFlow";

export const ProductTourBuilder = () => {
  const { tourId } = useParams<{ tourId: string }>();
  const { tour, isLoading, isLoaded, error } = useSavedProductTour(tourId);
  const builderTour = useProductTourBuilderStore((state) => state.tour);
  const setCompletionCta = useProductTourBuilderStore(
    (state) => state.setCompletionCta,
  );
  const [summaries, setSummaries] = useState<SavedFlowSummary[]>([]);

  usePersistProductTour(Boolean(tourId && isLoaded));

  const { activeHintId, dismissHint, skipAllHints } = useFirstTimeHintTour(PRODUCT_TOUR_HINT_SEQUENCE, {
    ready: isLoaded && Boolean(tour),
  });

  const pageHints: PageHintControl = useMemo(
    () => ({
      activeHintId,
      hintStep: (hintId) => getHintStepLabel(hintId, PRODUCT_TOUR_HINT_SEQUENCE),
      dismissHint,
      skipAllHints,
    }),
    [activeHintId, dismissHint, skipAllHints],
  );

  useEffect(() => {
    void listFlowSummaries().then(setSummaries);
  }, []);

  if (!tourId) {
    return (
      <ResourceNotFoundPage
        title="Invalid tour"
        description="Create a product tour from the dashboard."
      />
    );
  }

  if (error) {
    return <ResourceNotFoundPage title="Product tour not found" description={error} />;
  }

  if (isLoading || !isLoaded || !tour) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50">
        <PeacockStudioLoader size={160} />
        <p className="text-sm text-slate-500">Loading product tour builder…</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-100/80">
      <ProductTourBuilderToolbar tourId={tourId} pageHints={pageHints} />
      <main className="mx-auto grid w-full max-w-7xl flex-1 gap-6 px-4 py-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <ProductTourFeatureList summaries={summaries} pageHints={pageHints} />
        <div className="space-y-4">
          {builderTour ? (
            <HintAnchor
              hints={pageHints}
              hintId={PRODUCT_TOUR_HINT_IDS.overview}
              title="Tour overview"
              description="See how features and demos connect. This map mirrors what learners see in the sidebar."
              placement="bottom-start"
            >
              <ProductTourOverviewCanvas
                tour={builderTour}
                activeStageLabel="Builder mode · Editing structure"
              />
            </HintAnchor>
          ) : null}
          {builderTour ? (
            <HintAnchor
              hints={pageHints}
              hintId={PRODUCT_TOUR_HINT_IDS.completionCta}
              title="Completion CTA"
              description="Optional button on the final slide — link to docs, signup, or a next step."
              placement="top"
            >
              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-lg shadow-slate-200/60">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                  Completion CTA
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Optional action shown on the final completion slide.
                </p>
                <input
                  value={builderTour.completionCta?.label ?? ""}
                  onChange={(event) =>
                    setCompletionCta({
                      label: event.target.value,
                      url: builderTour.completionCta?.url ?? "",
                    })
                  }
                  placeholder="Button label"
                  className="mt-3 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none transition focus:border-peacock-300 focus:ring-2 focus:ring-peacock-500/30"
                />
                <input
                  value={builderTour.completionCta?.url ?? ""}
                  onChange={(event) =>
                    setCompletionCta({
                      label: builderTour.completionCta?.label ?? "Learn more",
                      url: event.target.value,
                    })
                  }
                  placeholder="https://"
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none transition focus:border-peacock-300 focus:ring-2 focus:ring-peacock-500/30"
                />
              </section>
            </HintAnchor>
          ) : null}
        </div>
      </main>
    </div>
  );
};
