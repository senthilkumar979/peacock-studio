import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { getPlayableStepRange, type FlowStep } from "@peacock/shared";
import { DASHBOARD_PATH } from "@/constants/routes";
import {
  getHintStepLabel,
  getProductTourLearnerHintSequence,
  PRODUCT_TOUR_LEARNER_HINT_IDS,
} from "@/constants/firstTimeHints";
import { EmptyFlowState } from "@/components/EmptyFlowState";
import { PeacockStudioLoader } from "@/components/PeacockStudioLoader";
import { AppHeader } from "@/components/AppHeader";
import { HintAnchor, type PageHintControl } from "@/components/onboarding/HintAnchor";
import { useFirstTimeHintTour } from "@/hooks/useFirstTimeHint";
import { useKeyboard } from "@/hooks/useKeyboard";
import { useProductTourLearner } from "@/hooks/useProductTourLearner";
import { useSavedProductTour } from "@/hooks/useSavedProductTour";
import { ProductTourOverviewCanvas } from "@/product-tour-builder/ProductTourOverviewCanvas";
import { RoutePeacockPlayer } from "@/route-learner/RoutePeacockPlayer";
import { PlayerStep } from "@/player/PlayerStep";
import { getFlowDocument } from "@/services/flowLibraryService";
import { getPersona } from "@/services/productTourLibraryService";
import { getSortedFeatures } from "@/store/productTourBuilderStore";
import type { Persona } from "@/types/persona";
import { countTourDemos } from "@/utils/createProductTour";
import {
  countTourStepsFromCounts,
  estimateTourDurationMinutes,
  findDemoIntroSegmentIndex,
  findFeatureIntroSegmentIndex,
  getTourDemoDisplayTitle,
} from "@/utils/productTourLearner";
import { TourCompletePanel } from "@/product-tour-learner/TourCompletePanel";
import { TourFeatureIntroPanel } from "@/product-tour-learner/TourFeatureIntroPanel";
import { TourPersonaIntroPanel } from "@/product-tour-learner/TourPersonaIntroPanel";
import { TourDetailsPanel } from "@/product-tour-learner/TourDetailsPanel";
import { TourDemoIntroPanel } from "@/product-tour-learner/TourDemoIntroPanel";
import { TourBranchPointPanel } from "@/product-tour-learner/TourBranchPointPanel";

interface ProductTourLearnerProps {
  tourId?: string;
  isPresenter?: boolean;
  isPublicShare?: boolean;
}

export const ProductTourLearner = ({
  tourId: tourIdProp,
  isPresenter: isPresenterProp,
  isPublicShare = false,
}: ProductTourLearnerProps = {}) => {
  const { tourId: routeTourId } = useParams<{ tourId: string }>();
  const [searchParams] = useSearchParams();
  const tourId = tourIdProp ?? routeTourId;
  const isPresenter =
    isPresenterProp ?? searchParams.get("presenter") === "1";
  const canEdit = !isPresenter && !isPublicShare;

  const { tour, isLoading, isLoaded, error } = useSavedProductTour(tourId);
  const playback = useProductTourLearner(tour);

  const learnerHintSequence = useMemo(
    () => getProductTourLearnerHintSequence({ canEdit }),
    [canEdit],
  );
  const { activeHintId, dismissHint } = useFirstTimeHintTour(learnerHintSequence, {
    ready: isLoaded && Boolean(tour) && !isPresenter,
  });
  const pageHints: PageHintControl = useMemo(
    () => ({
      activeHintId,
      hintStep: (hintId) => getHintStepLabel(hintId, learnerHintSequence),
      dismissHint,
    }),
    [activeHintId, dismissHint, learnerHintSequence],
  );

  const [persona, setPersona] = useState<Persona | null>(null);
  const [estimatedMinutes, setEstimatedMinutes] = useState<number | null>(null);
  const [isLoadingLinked, setIsLoadingLinked] = useState(false);
  const [linkedError, setLinkedError] = useState<string | null>(null);
  const [linkedPlayback, setLinkedPlayback] = useState<{
    steps: FlowStep[];
    screenshotUrls: Record<string, string>;
    stepIndex: number;
    branchTitle: string;
    pathLabel: string;
  } | null>(null);

  const features = useMemo(() => (tour ? getSortedFeatures(tour) : []), [tour]);

  useEffect(() => {
    if (!tour) return;
    void getPersona(tour.personaId).then((next) => setPersona(next ?? null));
    void estimateTourDurationMinutes(tour).then(setEstimatedMinutes);
  }, [tour]);

  const handleNext = useCallback(() => {
    if (!linkedPlayback) {
      playback.goNext();
      return;
    }
    if (linkedPlayback.stepIndex < linkedPlayback.steps.length - 1) {
      setLinkedPlayback((state) =>
        state ? { ...state, stepIndex: state.stepIndex + 1 } : state,
      );
      return;
    }
    setLinkedPlayback(null);
    setLinkedError(null);
    playback.goNext();
  }, [linkedPlayback, playback]);

  const handlePrevious = useCallback(() => {
    if (!linkedPlayback) {
      playback.goPrevious();
      return;
    }
    if (linkedPlayback.stepIndex > 0) {
      setLinkedPlayback((state) =>
        state ? { ...state, stepIndex: state.stepIndex - 1 } : state,
      );
      return;
    }
    setLinkedPlayback(null);
    setLinkedError(null);
  }, [linkedPlayback, playback]);

  useKeyboard({
    ArrowRight: handleNext,
    ArrowLeft: handlePrevious,
  });

  const onDocumentLoaded = useCallback(() => undefined, []);
  const segment = playback.currentSegment;

  const handleFeatureSelect = useCallback(
    (featureIndex: number) => {
      setLinkedPlayback(null);
      setLinkedError(null);
      const index = findFeatureIntroSegmentIndex(
        playback.segments,
        featureIndex,
      );
      if (index >= 0) playback.setCurrentIndex(index);
    },
    [playback],
  );

  const handleDemoSelect = useCallback(
    (featureIndex: number, demoIndex: number) => {
      setLinkedPlayback(null);
      setLinkedError(null);
      const index = findDemoIntroSegmentIndex(
        playback.segments,
        featureIndex,
        demoIndex,
      );
      if (index >= 0) playback.setCurrentIndex(index);
    },
    [playback],
  );

  const handleSelectBranchPath = useCallback(
    async (pathId: string) => {
      if (!segment || segment.type !== "demo-branch") return;
      const branch =
        playback.demoMeta?.[segment.featureIndex]?.[segment.demoIndex]
          ?.branches?.[segment.branchIndex];
      const path = branch?.paths.find((item) => item.id === pathId);
      if (!path) return;

      setIsLoadingLinked(true);
      setLinkedError(null);

      try {
        const doc = await getFlowDocument(path.targetDocumentId);
        if (!doc) {
          setLinkedError("This linked demo is no longer available.");
          return;
        }

        const slice = getPlayableStepRange(
          doc.steps,
          path.fromStepId,
          path.toStepId,
        );
        if (!slice?.length) {
          setLinkedError("The selected path has no playable steps.");
          return;
        }

        setLinkedPlayback({
          steps: slice,
          screenshotUrls: doc.screenshotUrls,
          stepIndex: 0,
          branchTitle: branch?.title || "Branch decision",
          pathLabel: path.label || "Selected path",
        });
      } finally {
        setIsLoadingLinked(false);
      }
    },
    [segment, playback.demoMeta],
  );

  if (!tourId) {
    return (
      <EmptyFlowState
        title="Invalid tour"
        description="Open a product tour from your dashboard."
      />
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 px-6 py-8 text-sm text-amber-800">
        {error} <Link to={DASHBOARD_PATH}>Go to dashboard</Link>
      </div>
    );
  }

  if (isLoading || !isLoaded || !tour || playback.isLoading || !persona) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50">
        <PeacockStudioLoader size={160} />
        <p className="text-sm text-slate-500">Loading product tour…</p>
      </div>
    );
  }

  const activeFeatureIndex =
    segment?.type === "feature-intro" ||
    segment?.type === "demo-intro" ||
    segment?.type === "demo-branch" ||
    segment?.type === "demo-step"
      ? segment.featureIndex
      : null;

  const activeDemoIndex =
    segment?.type === "demo-intro" ||
    segment?.type === "demo-branch" ||
    segment?.type === "demo-step"
      ? segment.demoIndex
      : null;

  const activeStageLabel = (() => {
    if (linkedPlayback) return "Inside selected branch path";
    if (!segment) return "Overview";
    if (segment.type === "persona-intro") return "Persona intro";
    if (segment.type === "tour-details") return "Tour details";
    if (segment.type === "feature-intro")
      return `Feature ${segment.featureIndex + 1} intro`;
    if (segment.type === "demo-intro") {
      const demo = features[segment.featureIndex]?.demos[segment.demoIndex];
      const demoTitle = demo
        ? getTourDemoDisplayTitle(
            demo,
            playback.demoMeta?.[segment.featureIndex]?.[segment.demoIndex],
            segment.demoIndex,
          )
        : null;
      return demoTitle
        ? `${demoTitle} intro`
        : `Demo ${segment.demoIndex + 1} intro`;
    }
    if (segment.type === "demo-branch") return "Branch point";
    if (segment.type === "demo-step")
      return `Demo step ${segment.stepIndex + 1}`;
    return "Tour complete";
  })();

  const activeBranchTitle =
    segment?.type === "demo-branch"
      ? (playback.demoMeta?.[segment.featureIndex]?.[segment.demoIndex]
          ?.branches?.[segment.branchIndex]?.title ?? null)
      : (linkedPlayback?.branchTitle ?? null);

  const activePathLabel = linkedPlayback?.pathLabel ?? null;

  const stepCount = countTourStepsFromCounts(playback.stepCounts);

  const renderStage = () => {
    if (isLoadingLinked) {
      return (
        <p className="text-sm text-slate-500">Loading linked branch demo…</p>
      );
    }
    if (linkedError) {
      return <p className="text-sm text-amber-800">{linkedError}</p>;
    }
    if (linkedPlayback) {
      const linkedStep = linkedPlayback.steps[linkedPlayback.stepIndex];
      if (!linkedStep) return null;
      return (
        <PlayerStep
          step={linkedStep}
          stepNumber={linkedPlayback.stepIndex + 1}
          screenshotUrls={linkedPlayback.screenshotUrls}
        />
      );
    }

    if (!segment) return null;

    if (segment.type === "persona-intro") {
      return (
        <TourPersonaIntroPanel
          persona={persona}
          tourGoal={tour.tourGoal}
          onContinue={playback.goNext}
        />
      );
    }

    if (segment.type === "tour-details") {
      return (
        <TourDetailsPanel
          tour={tour}
          estimatedMinutes={estimatedMinutes}
          featureCount={features.length}
          demoCount={countTourDemos(tour)}
          onContinue={playback.goNext}
        />
      );
    }

    if (segment.type === "feature-intro") {
      const feature = features[segment.featureIndex];
      if (!feature) return null;
      return (
        <TourFeatureIntroPanel
          feature={feature}
          featureNumber={segment.featureIndex + 1}
          onContinue={playback.goNext}
        />
      );
    }

    if (segment.type === "demo-intro") {
      const feature = features[segment.featureIndex];
      const demo = feature?.demos[segment.demoIndex];
      const demoStepCount =
        playback.stepCounts?.[segment.featureIndex]?.[segment.demoIndex] ?? 0;
      const demoMeta =
        playback.demoMeta?.[segment.featureIndex]?.[segment.demoIndex];
      if (!feature || !demo) return null;
      return (
        <TourDemoIntroPanel
          featureNumber={segment.featureIndex + 1}
          demo={demo}
          demoNumber={segment.demoIndex + 1}
          stepCount={demoStepCount}
          branchCount={demoMeta?.branchCount ?? 0}
          branches={demoMeta?.branches ?? []}
          onContinue={playback.goNext}
        />
      );
    }

    if (segment.type === "demo-step") {
      const feature = features[segment.featureIndex];
      const demo = feature?.demos[segment.demoIndex];
      if (!demo) return null;

      return (
        <RoutePeacockPlayer
          documentId={demo.documentId}
          stepIndex={segment.stepIndex}
          onDocumentLoaded={onDocumentLoaded}
        />
      );
    }

    if (segment.type === "demo-branch") {
      const branch =
        playback.demoMeta?.[segment.featureIndex]?.[segment.demoIndex]
          ?.branches?.[segment.branchIndex];
      if (!branch) return null;
      return (
        <TourBranchPointPanel
          featureNumber={segment.featureIndex + 1}
          demoNumber={segment.demoIndex + 1}
          branch={branch}
          onSelectPath={handleSelectBranchPath}
        />
      );
    }

    return (
      <TourCompletePanel
        tour={tour}
        persona={persona}
        featureCount={features.length}
        demoCount={countTourDemos(tour)}
        stepCount={stepCount}
        onReplay={playback.replay}
      />
    );
  };

  return (
    <div
      className={`flex h-screen flex-col overflow-hidden bg-slate-50 ${isPresenter ? "presenter-mode" : ""}`}
    >
      {!isPresenter && !isPublicShare ? (
        <AppHeader
          eyebrow="Product Tours"
          title={tour.title}
          description={tour.description || undefined}
          homeLink
          tourId={tourId}
          tour={tour}
        >
          <HintAnchor
            hints={pageHints}
            hintId={PRODUCT_TOUR_LEARNER_HINT_IDS.editTour}
            title="Edit tour"
            description="Return to the builder to adjust features, demos, persona, or publish status."
            placement="bottom"
          >
            <Link
              to={`/tours/${tourId}/edit`}
              className="rounded-lg border border-peacock-200 bg-peacock-50 px-3 py-2 text-sm font-medium text-peacock-800"
            >
              Edit tour
            </Link>
          </HintAnchor>
        </AppHeader>
      ) : null}
      {isPublicShare && !isPresenter ? (
        <header className="shrink-0 border-b border-slate-200 bg-white px-6 py-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-peacock-600">
            Shared product tour
          </p>
          <h1 className="mt-1 text-lg font-bold text-slate-900">{tour.title}</h1>
          {tour.description ? (
            <p className="mt-1 text-sm text-slate-600">{tour.description}</p>
          ) : null}
        </header>
      ) : null}

      <main className="mx-auto flex min-h-0 w-full max-w-8xl flex-1 gap-6 overflow-hidden px-4 py-6">
        {!isPresenter ? (
          <aside className="hidden h-full min-h-0 w-[400px] shrink-0 lg:flex lg:flex-col">
            <HintAnchor
              hints={pageHints}
              hintId={PRODUCT_TOUR_LEARNER_HINT_IDS.overview}
              title="Tour map"
              description="See where you are in the tour. Click a feature or demo to jump ahead."
              placement="bottom-start"
            >
              <ProductTourOverviewCanvas
                className="h-full min-h-0"
                tour={tour}
                activeFeatureIndex={activeFeatureIndex}
                activeDemoIndex={activeDemoIndex}
                demoMeta={playback.demoMeta}
                activeStageLabel={activeStageLabel}
                activeBranchTitle={activeBranchTitle}
                activePathLabel={activePathLabel}
                onFeatureSelect={handleFeatureSelect}
                onDemoSelect={handleDemoSelect}
              />
            </HintAnchor>
          </aside>
        ) : null}
        <div className="flex min-h-0 flex-1 items-center justify-center overflow-y-auto">
          {renderStage()}
        </div>
      </main>

      {!isPresenter ? (
        <HintAnchor
          hints={pageHints}
          hintId={PRODUCT_TOUR_LEARNER_HINT_IDS.navigation}
          title="Navigate the tour"
          description="Use Previous and Next to move through segments. Arrow keys work too."
          placement="top"
        >
          <footer className="flex shrink-0 items-center justify-between border-t border-slate-200 bg-white px-6 py-4">
            <p className="text-sm text-slate-500">
              {playback.currentIndex + 1} of {playback.segments.length}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={playback.currentIndex === 0 && !linkedPlayback}
                onClick={handlePrevious}
                className="rounded-lg border px-3 py-2 text-sm disabled:opacity-50"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={playback.isAtComplete && !linkedPlayback}
                onClick={handleNext}
                className="rounded-lg border px-3 py-2 text-sm disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </footer>
        </HintAnchor>
      ) : null}
    </div>
  );
};
