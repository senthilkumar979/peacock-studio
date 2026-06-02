import {
  GitBranch,
  Layers,
  ListOrdered,
  RotateCcw,
  Sparkles,
} from "lucide-react";

interface PlayerFinaleProps {
  title: string;
  description: string;
  stepCount: number;
  branchCount: number;
  sectionCount: number;
  onReplay: () => void;
}

export const PlayerFinale = ({
  title,
  description,
  stepCount,
  branchCount,
  sectionCount,
  onReplay,
}: PlayerFinaleProps) => {
  const hasDescription = Boolean(description);

  return (
    <article className="relative mx-auto w-full max-w-2xl overflow-hidden rounded-3xl border border-rose-200/60 shadow-xl shadow-rose-200/30">
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-rose-50 via-rose-300 to-amber-300"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/30 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-20 -left-12 h-56 w-56 rounded-full bg-amber-200/40 blur-3xl"
        aria-hidden
      />

      <div className="relative z-10 px-8 py-10 sm:px-10 sm:py-12">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/70 text-rose-700 shadow-lg shadow-rose-300/30 ring-1 ring-white/80 backdrop-blur-sm">
            <Sparkles className="h-7 w-7" aria-hidden />
          </div>

          <div className="min-w-0 flex-1">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/70 bg-white/60 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-rose-800 backdrop-blur-sm">
              Guide complete
            </span>

            <h2 className="mt-4 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
              {title}
            </h2>

            <div className="mt-5">
              {hasDescription ? (
                <p className="mt-2 rounded-2xl p-4 text-base leading-relaxed text-slate-800 sm:text-md">
                  {description}
                </p>
              ) : (
                <p className="mt-2 text-sm italic text-slate-700/80">
                  No description provided.
                </p>
              )}
            </div>

            <dl className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <FinaleStat icon={ListOrdered} label="Steps" value={stepCount} />
              <FinaleStat
                icon={GitBranch}
                label="Branches"
                value={branchCount}
              />
              <FinaleStat icon={Layers} label="Sections" value={sectionCount} />
            </dl>
            <div className="mt-8 flex justify-center">
              <button
                type="button"
                onClick={onReplay}
                className="flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 transition hover:bg-slate-800"
              >
                <RotateCcw className="h-4 w-4" aria-hidden />
                Replay
              </button>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
};

interface FinaleStatProps {
  icon: typeof ListOrdered;
  label: string;
  value: number;
}

const FinaleStat = ({ icon: Icon, label, value }: FinaleStatProps) => (
  <div className="rounded-2xl border border-white/70 bg-white/60 px-4 py-3 backdrop-blur-sm">
    <dt className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-rose-900/70">
      <Icon className="h-3.5 w-3.5" aria-hidden />
      {label}
    </dt>
    <dd className="mt-1 text-2xl font-bold text-slate-900">{value}</dd>
  </div>
);
