import {
  ArrowUp,
  CheckCircle2,
  GitBranch,
  Layers,
  ListOrdered,
} from 'lucide-react';

interface DocumentGuideCompleteCardProps {
  title: string;
  stepCount: number;
  sectionCount: number;
  branchCount: number;
  onViewFromBeginning: () => void;
}

interface CompleteStatProps {
  icon: typeof ListOrdered;
  label: string;
  value: number;
}

const CompleteStat = ({ icon: Icon, label, value }: CompleteStatProps) => (
  <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
    <dt className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
      <Icon className="h-3.5 w-3.5" aria-hidden />
      {label}
    </dt>
    <dd className="mt-1 text-2xl font-bold text-slate-900">{value}</dd>
  </div>
);

export const DocumentGuideCompleteCard = ({
  title,
  stepCount,
  sectionCount,
  branchCount,
  onViewFromBeginning,
}: DocumentGuideCompleteCardProps) => (
  <article
    id="guide-complete"
    data-outline-id="guide-complete"
    className="scroll-mt-24 overflow-hidden rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-peacock-50/40 shadow-sm"
  >
    <div className="border-b border-emerald-100/80 px-5 py-4 sm:px-6">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200">
          <CheckCircle2 className="h-5 w-5" aria-hidden />
        </span>
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-700">
            Guide complete
          </p>
          <h2 className="mt-1 text-lg font-bold text-slate-900 sm:text-xl">{title}</h2>
          <p className="mt-1 text-sm text-slate-600">
            You have reached the end of this flow documentation.
          </p>
        </div>
      </div>
    </div>

    <div className="px-5 py-5 sm:px-6">
      <dl className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <CompleteStat icon={ListOrdered} label="Steps" value={stepCount} />
        <CompleteStat icon={Layers} label="Sections" value={sectionCount} />
        <CompleteStat icon={GitBranch} label="Branches" value={branchCount} />
      </dl>

      <button
        type="button"
        onClick={onViewFromBeginning}
        className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-peacock-200 hover:bg-peacock-50 hover:text-peacock-900 sm:w-auto"
      >
        <ArrowUp className="h-4 w-4" aria-hidden />
        View from beginning
      </button>
    </div>
  </article>
);
