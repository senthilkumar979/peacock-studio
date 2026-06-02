import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { EmptyFlowState } from '@/components/EmptyFlowState';
import { PeacockStudioLoader } from '@/components/PeacockStudioLoader';
import { AppHeader } from '@/components/AppHeader';
import { useKeyboard } from '@/hooks/useKeyboard';
import { useProductTourLearner } from '@/hooks/useProductTourLearner';
import { useSavedProductTour } from '@/hooks/useSavedProductTour';
import { ProductTourOverviewCanvas } from '@/product-tour-builder/ProductTourOverviewCanvas';
import { RoutePeacockPlayer } from '@/route-learner/RoutePeacockPlayer';
import { getPersona } from '@/services/productTourLibraryService';
import { getSortedFeatures } from '@/store/productTourBuilderStore';
import type { Persona } from '@/types/persona';
import { countTourDemos } from '@/utils/createProductTour';
import {
  countTourStepsFromCounts,
  estimateTourDurationMinutes,
} from '@/utils/productTourLearner';
import { TourCompletePanel } from '@/product-tour-learner/TourCompletePanel';
import { TourFeatureIntroPanel } from '@/product-tour-learner/TourFeatureIntroPanel';
import { TourPersonaIntroPanel } from '@/product-tour-learner/TourPersonaIntroPanel';
import { TourDetailsPanel } from '@/product-tour-learner/TourDetailsPanel';
import { TourDemoIntroPanel } from '@/product-tour-learner/TourDemoIntroPanel';

export const ProductTourLearner = () => {
  const { tourId } = useParams<{ tourId: string }>();
  const [searchParams] = useSearchParams();
  const isPresenter = searchParams.get('presenter') === '1';

  const { tour, isLoading, isLoaded, error } = useSavedProductTour(tourId);
  const playback = useProductTourLearner(tour);

  const [persona, setPersona] = useState<Persona | null>(null);
  const [estimatedMinutes, setEstimatedMinutes] = useState<number | null>(null);

  const features = useMemo(() => (tour ? getSortedFeatures(tour) : []), [tour]);

  useEffect(() => {
    if (!tour) return;
    void getPersona(tour.personaId).then((next) => setPersona(next ?? null));
    void estimateTourDurationMinutes(tour).then(setEstimatedMinutes);
  }, [tour]);

  useKeyboard({
    ArrowRight: () => playback.goNext(),
    ArrowLeft: () => playback.goPrevious(),
  });

  const onDocumentLoaded = useCallback(() => undefined, []);

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
        {error} <Link to="/">Go to dashboard</Link>
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

  const segment = playback.currentSegment;

  const activeFeatureIndex =
    segment?.type === 'feature-intro' || segment?.type === 'demo-intro' || segment?.type === 'demo-step'
      ? segment.featureIndex
      : null;

  const activeDemoIndex =
    segment?.type === 'demo-intro' || segment?.type === 'demo-step' ? segment.demoIndex : null;

  const stepCount = countTourStepsFromCounts(playback.stepCounts);

  const renderStage = () => {
    if (!segment) return null;

    if (segment.type === 'persona-intro') {
      return (
        <TourPersonaIntroPanel persona={persona} onContinue={playback.goNext} />
      );
    }

    if (segment.type === 'tour-details') {
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

    if (segment.type === 'feature-intro') {
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

    if (segment.type === 'demo-intro') {
      const feature = features[segment.featureIndex];
      const demo = feature?.demos[segment.demoIndex];
      const demoStepCount = playback.stepCounts?.[segment.featureIndex]?.[segment.demoIndex] ?? 0;
      if (!feature || !demo) return null;
      return (
        <TourDemoIntroPanel
          featureNumber={segment.featureIndex + 1}
          demo={demo}
          demoNumber={segment.demoIndex + 1}
          stepCount={demoStepCount}
          onContinue={playback.goNext}
        />
      );
    }

    if (segment.type === 'demo-step') {
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
    <div className={`flex h-screen flex-col overflow-hidden bg-slate-50 ${isPresenter ? 'presenter-mode' : ''}`}>
      {!isPresenter ? (
        <AppHeader
          eyebrow="Product Tours"
          title={tour.title}
          description={tour.description || undefined}
          homeLink
          tourId={tourId}
          tour={tour}
        >
          <Link
            to={`/tours/${tourId}/edit`}
            className="rounded-lg border border-peacock-200 bg-peacock-50 px-3 py-2 text-sm font-medium text-peacock-800"
          >
            Edit tour
          </Link>
        </AppHeader>
      ) : null}

      <main className="mx-auto flex min-h-0 w-full max-w-7xl flex-1 gap-6 overflow-hidden px-4 py-6">
        {!isPresenter ? (
          <aside className="hidden w-72 shrink-0 lg:block">
            <ProductTourOverviewCanvas
              tour={tour}
              activeFeatureIndex={activeFeatureIndex}
              activeDemoIndex={activeDemoIndex}
            />
          </aside>
        ) : null}
        <div className="flex min-h-0 flex-1 items-center justify-center overflow-y-auto">
          {renderStage()}
        </div>
      </main>

      {!isPresenter ? (
        <footer className="flex items-center justify-between border-t border-slate-200 bg-white px-6 py-4">
          <p className="text-sm text-slate-500">
            {playback.currentIndex + 1} of {playback.segments.length}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={playback.currentIndex === 0}
              onClick={playback.goPrevious}
              className="rounded-lg border px-3 py-2 text-sm disabled:opacity-50"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={playback.isAtComplete}
              onClick={playback.goNext}
              className="rounded-lg border px-3 py-2 text-sm disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </footer>
      ) : null}
    </div>
  );
};
