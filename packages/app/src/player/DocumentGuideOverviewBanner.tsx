import { ArrowUpRight, LayoutGrid } from 'lucide-react';

interface DocumentGuideOverviewBannerProps {
  title: string;
  stepCount: number;
  onOpenOverview: () => void;
}

export const DocumentGuideOverviewBanner = ({
  title,
  stepCount,
  onOpenOverview,
}: DocumentGuideOverviewBannerProps) => (
  <div className="rounded-2xl border border-peacock-200/70 bg-gradient-to-r from-peacock-50/90 via-white to-white p-4 shadow-sm ring-1 ring-peacock-100 sm:p-5">
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-peacock-700">
          Flow overview
        </p>
        <p className="mt-1 truncate text-sm font-semibold text-slate-900 sm:text-base">{title}</p>
        <p className="mt-1 text-sm text-slate-600">
          {stepCount} {stepCount === 1 ? 'step' : 'steps'} · deliverables and captured environment live
          on the overview page.
        </p>
      </div>

      <button
        type="button"
        onClick={onOpenOverview}
        className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-peacock-200 bg-white px-4 py-2.5 text-sm font-semibold text-peacock-800 shadow-sm transition hover:bg-peacock-50"
      >
        <LayoutGrid className="h-4 w-4" aria-hidden />
        Open overview
        <ArrowUpRight className="h-4 w-4 opacity-70" aria-hidden />
      </button>
    </div>
  </div>
);
