import { Link } from 'react-router-dom';
import { AppHeader } from '@/components/AppHeader';
import { ResourceNotFoundPage } from '@/components/errors/ResourceNotFoundPage';
import { EmptyFlowState } from '@/components/EmptyFlowState';
import { PeacockStudioLoader } from '@/components/PeacockStudioLoader';
import { useRouteLearner } from '@/hooks/useRouteLearner';
import { RouteLearnerControls } from '@/route-learner/RouteLearnerControls';
import { RouteLearnerProgress } from '@/route-learner/RouteLearnerProgress';
import { RouteLearnerSidebar } from '@/route-learner/RouteLearnerSidebar';
import { RouteLearnerStage } from '@/route-learner/RouteLearnerStage';

export const RouteLearner = () => {
  const learner = useRouteLearner();

  if (!learner.routeId) {
    return (
      <ResourceNotFoundPage
        title="Invalid route"
        description="Open a route from your dashboard."
      />
    );
  }

  if (learner.error) {
    return <ResourceNotFoundPage title="Route not found" description={learner.error} />;
  }

  if (learner.isLoading || !learner.isLoaded || !learner.route || !learner.state) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50">
        <PeacockStudioLoader size={160} />
        <p className="text-sm text-slate-500">Loading route…</p>
      </div>
    );
  }

  if (!learner.hasPlayableContent) {
    return (
      <div className="flex min-h-screen flex-col bg-slate-50">
        <AppHeader
          eyebrow="RouteHub"
          title={learner.route.title}
          description={learner.route.description || undefined}
          homeLink
          routeId={learner.routeId}
          route={learner.route}
        />
        <EmptyFlowState
          title="No demos in this route"
          description="Add demos to chapters in the route builder before learning."
        />
      </div>
    );
  }

  const { route, routeId, state, segments, stepCount } = learner;

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-slate-100">
      <AppHeader
        eyebrow="RouteHub"
        title={route.title}
        description={route.description || undefined}
        homeLink
        routeId={routeId}
        route={route}
      >
        <Link
          to={`/routes/${routeId}/edit`}
          className="rounded-lg border border-peacock-200 bg-peacock-50 px-3 py-2 text-sm font-medium text-peacock-800 hover:bg-peacock-100"
        >
          Edit route
        </Link>
      </AppHeader>

      <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[280px_1fr]">
        <RouteLearnerSidebar
          segments={segments}
          state={state}
          pendingTransition={learner.pendingTransition}
          onSelectSegment={learner.handleSelectSegment}
        />
        <div className="flex min-h-0 flex-col">
          <RouteLearnerProgress
            routeTitle={route.title}
            segments={segments}
            state={state}
            highlightedSegmentIndex={learner.highlightedSegmentIndex}
            stepIndex={state.stepIndex}
            stepCount={stepCount}
            isTransitionActive={learner.isTransitionActive}
          />
          <main className="flex min-h-0 flex-1 items-center justify-center overflow-y-auto px-3 py-6 md:px-8">
            <RouteLearnerStage
              pendingTransition={learner.pendingTransition}
              pendingDemoSummary={learner.pendingDemoSummary}
              onConfirmTransition={learner.confirmTransition}
              currentNode={learner.currentNode}
              state={state}
              branchActive={learner.branchActive}
              formActive={learner.formActive}
              interestActive={learner.interestActive}
              formResponses={learner.formResponses}
              selectedTopicIds={learner.selectedTopicIds}
              activeDocumentId={learner.activeDocumentId}
              onDocumentLoaded={learner.handleDocumentLoaded}
              onBranchSelect={learner.handleBranchSelect}
              onFormChange={learner.handleFormChange}
              onInterestToggle={learner.handleInterestToggle}
            />
          </main>
          <RouteLearnerControls
            route={route}
            state={state}
            stepCount={stepCount}
            segmentIndex={Math.max(learner.highlightedSegmentIndex, 0)}
            segmentCount={segments.length}
            pendingTransition={learner.pendingTransition}
            canGoPrevious={learner.canGoPrevious}
            canGoNext={learner.canGoNext}
            isComplete={learner.isComplete}
            isAtRouteStart={learner.isAtRouteStart}
            isAtRouteEnd={learner.isAtRouteEnd}
            onPrevious={learner.handlePrevious}
            onNext={learner.handleNext}
            onGoToFirst={segments.length > 1 ? learner.goToFirstSegment : undefined}
            onGoToLast={segments.length > 1 ? learner.goToLastSegment : undefined}
          />
        </div>
      </div>
    </div>
  );
};
