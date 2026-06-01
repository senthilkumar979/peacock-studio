import { BookOpen, ChevronRight, Layers } from 'lucide-react';
import type { RouteChapterTransition } from '@/utils/routeLearnerTransitions';

interface RouteChapterIntroProps {
  transition: RouteChapterTransition;
  onStart: () => void;
}

export const RouteChapterIntro = ({ transition, onStart }: RouteChapterIntroProps) => (
  <div className="mx-auto w-full max-w-2xl animate-[fadeIn_0.35s_ease-out] px-2">
    <div className="overflow-hidden rounded-3xl border border-peacock-200/80 bg-white shadow-xl shadow-peacock-900/5">
      <div className="bg-gradient-to-br from-peacock-600 via-brand-violet to-brand-cyan px-8 py-10 text-white">
        <div className="flex items-center gap-2 text-white/80">
          <Layers className="h-4 w-4" aria-hidden />
          <p className="text-xs font-semibold uppercase tracking-[0.2em]">
            Chapter {transition.chapterIndex + 1}
          </p>
        </div>
        <h2 className="mt-4 text-3xl font-bold tracking-tight">{transition.title}</h2>
        {transition.demoCount > 0 ? (
          <p className="mt-3 text-sm text-white/85">
            {transition.demoCount} interactive demo{transition.demoCount === 1 ? '' : 's'} in this chapter
          </p>
        ) : null}
      </div>

      <div className="space-y-6 px-8 py-8">
        <div className="flex gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-peacock-50 text-peacock-700">
            <BookOpen className="h-6 w-6" aria-hidden />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">About this chapter</p>
            {transition.description ? (
              <p className="mt-2 text-base leading-relaxed text-slate-700">{transition.description}</p>
            ) : (
              <p className="mt-2 text-base text-slate-500">
                Explore the demos in this chapter at your own pace.
              </p>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={onStart}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-peacock-600 to-brand-violet px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-peacock-600/25 transition hover:brightness-105"
        >
          Start chapter
          <ChevronRight className="h-4 w-4" aria-hidden />
        </button>
      </div>
    </div>
  </div>
);
