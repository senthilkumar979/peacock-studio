import type { RouteLearnerGraphState } from '@/types/route';
import { getRouteNode } from '@/utils/routeGraph';
import type { SavedRoute } from '@/types/route';
import type { RouteLearnerTransition } from '@/utils/routeLearnerTransitions';

interface RouteLearnerControlsProps {
  route: SavedRoute;
  state: RouteLearnerGraphState;
  stepCount: number;
  segmentIndex: number;
  segmentCount: number;
  pendingTransition: RouteLearnerTransition | null;
  canGoPrevious: boolean;
  canGoNext: boolean;
  isComplete: boolean;
  isAtRouteStart: boolean;
  isAtRouteEnd: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onGoToFirst?: () => void;
  onGoToLast?: () => void;
}

export const RouteLearnerControls = ({
  route,
  state,
  stepCount,
  segmentIndex,
  segmentCount,
  pendingTransition,
  canGoPrevious,
  canGoNext,
  isComplete,
  isAtRouteStart,
  isAtRouteEnd,
  onPrevious,
  onNext,
  onGoToFirst,
  onGoToLast,
}: RouteLearnerControlsProps) => {
  const node = getRouteNode(route, state.currentNodeId);

  const stepLabel = pendingTransition
    ? pendingTransition.kind === 'chapter'
      ? 'Review chapter details, then continue'
      : 'Review demo details, then continue'
    : node?.type === 'branch'
      ? 'Choose a path to continue'
      : node?.type === 'form'
        ? 'Complete the form to continue'
        : node?.type === 'interest'
          ? 'Select your interests to continue'
          : stepCount > 0
            ? `Step ${state.stepIndex + 1} of ${stepCount}`
            : 'No steps in this demo';

  const primaryLabel = pendingTransition
    ? pendingTransition.kind === 'chapter'
      ? 'Start chapter'
      : 'Start demo'
    : isComplete || isAtRouteEnd
      ? 'Finished'
      : node?.type === 'branch' || node?.type === 'form' || node?.type === 'interest'
        ? 'Continue'
        : 'Next';

  const contextTitle = pendingTransition
    ? pendingTransition.kind === 'chapter'
      ? pendingTransition.title
      : `Demo ${pendingTransition.demoNumber}`
    : node?.title;

  const routePositionLabel =
    segmentCount > 0
      ? `Stop ${Math.min(segmentIndex + 1, segmentCount)} of ${segmentCount}`
      : null;

  return (
    <div className="flex shrink-0 flex-col gap-3 border-t border-slate-200 bg-white px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
      <div className="min-w-0">
        {contextTitle ? (
          <>
            <p className="truncate text-sm font-medium text-slate-900">{contextTitle}</p>
            <p className="text-xs text-slate-500">
              {routePositionLabel ? `${routePositionLabel} · ` : ''}
              {stepLabel}
            </p>
          </>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center justify-end gap-2">
        {segmentCount > 1 && onGoToFirst && onGoToLast ? (
          <div className="mr-auto flex items-center gap-1">
            <button
              type="button"
              onClick={onGoToFirst}
              disabled={isAtRouteStart && !pendingTransition}
              className="rounded-lg border border-slate-200 px-2.5 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40"
            >
              Chapter 1
            </button>
            <button
              type="button"
              onClick={onGoToLast}
              disabled={isAtRouteEnd && !pendingTransition}
              className="rounded-lg border border-slate-200 px-2.5 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40"
            >
              Last stop
            </button>
          </div>
        ) : null}
        <button
          type="button"
          onClick={onPrevious}
          disabled={!canGoPrevious}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pendingTransition ? 'Back' : 'Previous'}
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!canGoNext}
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {primaryLabel}
        </button>
      </div>
    </div>
  );
};
