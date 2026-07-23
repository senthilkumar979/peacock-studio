import { GitBranch, Sparkles } from 'lucide-react';
import type { DemoBranchMeta } from '@/utils/productTourLearner';

interface TourBranchPointPanelProps {
  featureNumber: number;
  demoNumber: number;
  branch: DemoBranchMeta;
  onSelectPath: (pathId: string) => void;
}

export const TourBranchPointPanel = ({
  featureNumber,
  demoNumber,
  branch,
  onSelectPath,
}: TourBranchPointPanelProps) => (
  <div className="relative mx-auto w-full max-w-2xl">
    <div className="pointer-events-none absolute inset-x-0 -top-8 bottom-0 -z-10 overflow-hidden" aria-hidden>
      <div className="absolute inset-0 bg-gradient-to-b from-peacock-50/70 via-slate-50/30 to-transparent" />
      <div className="absolute left-1/2 top-0 h-56 w-[min(100%,28rem)] -translate-x-1/2 rounded-full bg-peacock-200/25 blur-3xl" />
    </div>

    <article className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white/80 p-8 shadow-xl shadow-slate-200/40 backdrop-blur-xl supports-[backdrop-filter]:bg-white/70 sm:p-10">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute inset-0 bg-gradient-to-br from-peacock-50/80 via-white/50 to-brand-cyan/[0.04]" />
        <div className="absolute -right-16 -top-16 h-44 w-44 rounded-full bg-peacock-200/30 blur-3xl" />
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-peacock-300/70 to-transparent"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-peacock-500 via-peacock-600 to-brand-cyan/80 opacity-90"
      />

      <div className="relative z-10">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-peacock-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-peacock-700 ring-1 ring-peacock-100">
            <Sparkles className="h-3.5 w-3.5" aria-hidden />
            Branch point
          </span>
          <span className="inline-flex items-center rounded-full bg-slate-100/90 px-3 py-1 text-xs font-semibold text-slate-600 ring-1 ring-slate-200/80">
            Feature {featureNumber}
          </span>
          <span className="inline-flex items-center rounded-full bg-slate-100/90 px-3 py-1 text-xs font-semibold text-slate-600 ring-1 ring-slate-200/80">
            Demo {demoNumber}
          </span>
        </div>

        <div className="mt-5 flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-peacock-500 to-peacock-700 text-white shadow-md shadow-peacock-500/20 ring-1 ring-peacock-600/10">
            <GitBranch className="h-5 w-5" aria-hidden />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              {branch.title || 'Branch decision'}
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Choose 1 path to continue. This branch has {branch.pathCount} path
              {branch.pathCount === 1 ? '' : 's'}.
            </p>
          </div>
        </div>

        <div className="mt-6 space-y-2">
          {branch.paths.map((path) => (
            <button
              key={path.id}
              type="button"
              onClick={() => onSelectPath(path.id)}
              className="flex w-full items-start gap-3 rounded-xl border border-slate-200/90 bg-white/90 px-4 py-3 text-left shadow-sm transition hover:border-peacock-300/70 hover:bg-peacock-50/60"
            >
              <GitBranch className="mt-0.5 h-4 w-4 shrink-0 text-peacock-600" aria-hidden />
              <span className="text-sm font-medium text-slate-800">
                {path.label || 'Untitled path'}
              </span>
            </button>
          ))}
        </div>
      </div>
    </article>
  </div>
);
