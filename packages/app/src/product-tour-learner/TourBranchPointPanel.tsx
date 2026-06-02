import { GitBranch } from 'lucide-react';
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
  <article className="relative mx-auto w-full max-w-2xl overflow-hidden rounded-3xl border border-brand-violet/25 bg-white p-8 shadow-xl sm:p-10">
    <div
      className="pointer-events-none absolute inset-0 bg-gradient-to-br from-brand-violet/5 via-white to-peacock-50/40"
      aria-hidden
    />
    <div className="relative z-10">
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center rounded-full bg-brand-violet/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-violet">
          Branch point
        </span>
        <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
          Feature {featureNumber}
        </span>
        <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
          Demo {demoNumber}
        </span>
      </div>

      <div className="mt-5 flex items-start gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-violet/10 text-brand-violet ring-1 ring-brand-violet/20">
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
            className="flex w-full items-start gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-left transition hover:border-brand-violet/40 hover:bg-brand-violet/5"
          >
            <GitBranch className="mt-0.5 h-4 w-4 shrink-0 text-brand-violet" aria-hidden />
            <span className="text-sm font-medium text-slate-800">
              {path.label || 'Untitled path'}
            </span>
          </button>
        ))}
      </div>
    </div>
  </article>
);

