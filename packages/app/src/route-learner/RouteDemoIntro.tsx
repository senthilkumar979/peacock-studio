import { ChevronRight, Play, Sparkles } from 'lucide-react';
import type { SavedFlowSummary } from '@/types/savedFlow';
import type { RouteDemoTransition } from '@/utils/routeLearnerTransitions';

interface RouteDemoIntroProps {
  transition: RouteDemoTransition;
  summary?: SavedFlowSummary;
  onStart: () => void;
}

export const RouteDemoIntro = ({ transition, summary, onStart }: RouteDemoIntroProps) => {
  const title = summary?.title ?? transition.demoLabel ?? `Demo ${transition.demoNumber}`;
  const description = summary?.description;
  const stepCount = summary?.stepCount;

  return (
    <div className="mx-auto w-full max-w-2xl animate-[fadeIn_0.35s_ease-out] px-2">
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-900/5">
        <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-peacock-50/60 px-8 py-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-violet">
            {transition.chapterTitle} · Demo {transition.demoNumber} of {transition.demoCount}
          </p>
          <h2 className="mt-3 text-2xl font-bold tracking-tight text-slate-900">{title}</h2>
          {stepCount != null && stepCount > 0 ? (
            <p className="mt-2 text-sm text-slate-500">{stepCount} guided steps</p>
          ) : null}
        </div>

        <div className="space-y-6 px-8 py-8">
          <div className="flex gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-violet/10 text-brand-violet">
              <Sparkles className="h-6 w-6" aria-hidden />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Up next</p>
              {description ? (
                <p className="mt-2 text-base leading-relaxed text-slate-700">{description}</p>
              ) : (
                <p className="mt-2 text-base text-slate-500">
                  A hands-on walkthrough — use Next when you are ready to move through each step.
                </p>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={onStart}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            <Play className="h-4 w-4 fill-current" aria-hidden />
            Start demo
            <ChevronRight className="h-4 w-4" aria-hidden />
          </button>
        </div>
      </div>
    </div>
  );
};
