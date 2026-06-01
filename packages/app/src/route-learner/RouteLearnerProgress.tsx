import type { RouteLearnerGraphState, RouteSegment } from '@/types/route';
import { getActiveSegmentIndex } from '@/utils/routeLearnerNavigation';

interface RouteLearnerProgressProps {
  routeTitle: string;
  segments: RouteSegment[];
  state: RouteLearnerGraphState;
  highlightedSegmentIndex: number;
  stepIndex: number;
  stepCount: number;
  isTransitionActive: boolean;
}

export const RouteLearnerProgress = ({
  routeTitle,
  segments,
  state,
  highlightedSegmentIndex,
  stepIndex,
  stepCount,
  isTransitionActive,
}: RouteLearnerProgressProps) => {
  const activeIndex = getActiveSegmentIndex(segments, state);
  const progressIndex =
    highlightedSegmentIndex >= 0 ? highlightedSegmentIndex : activeIndex >= 0 ? activeIndex : 0;
  const progressPercent =
    segments.length > 0 ? Math.round(((progressIndex + 1) / segments.length) * 100) : 0;
  const activeSegment =
    segments[progressIndex] ?? (activeIndex >= 0 ? segments[activeIndex] : undefined);
  const stepPercent =
    stepCount > 0 && !isTransitionActive
      ? Math.round(((stepIndex + 1) / stepCount) * 100)
      : 0;

  return (
    <div className="shrink-0 border-b border-slate-200 bg-white px-4 py-3 lg:px-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="truncate text-xs font-medium text-slate-500">{routeTitle}</p>
        {segments.length > 0 ? (
          <p className="text-xs font-semibold text-peacock-700">
            {progressIndex + 1} / {segments.length} stops
          </p>
        ) : null}
      </div>

      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-gradient-to-r from-peacock-500 to-brand-violet transition-all duration-500"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {activeSegment && !isTransitionActive && stepCount > 0 ? (
        <div className="mt-2 flex items-center justify-between gap-3 text-xs text-slate-500">
          <span className="truncate font-medium text-slate-700">{activeSegment.chapterTitle}</span>
          <span>
            Step {stepIndex + 1} of {stepCount}
          </span>
        </div>
      ) : activeSegment && isTransitionActive ? (
        <p className="mt-2 truncate text-xs font-medium text-slate-600">{activeSegment.chapterTitle}</p>
      ) : null}

      {!isTransitionActive && stepCount > 0 ? (
        <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-brand-cyan/80 transition-all duration-300"
            style={{ width: `${stepPercent}%` }}
          />
        </div>
      ) : null}
    </div>
  );
};
