import { Maximize2, X } from 'lucide-react';
import type { WorkflowGraphStats } from '@/workflow-artifacts/flowMapCanvasTheme';
import { FLOW_MAP_KIND_THEMES } from '@/workflow-artifacts/flowMapCanvasTheme';

interface FlowMapCanvasToolbarProps {
  flowTitle: string;
  stats: WorkflowGraphStats;
  onFitView: () => void;
  onClearSelection: () => void;
  hasSelection: boolean;
}

export const FlowMapCanvasToolbar = ({
  flowTitle,
  stats,
  onFitView,
  onClearSelection,
  hasSelection,
}: FlowMapCanvasToolbarProps) => (
  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-gradient-to-r from-slate-950 via-slate-900 to-peacock-950 px-4 py-3 sm:px-5">
    <div className="min-w-0">
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-peacock-300">
        Interactive flow map
      </p>
      <p className="truncate text-sm font-semibold text-white sm:text-base">{flowTitle}</p>
    </div>

    <div className="flex flex-wrap items-center gap-2">
      <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs font-medium text-white ring-1 ring-white/15">
        {stats.steps} steps
      </span>
      {stats.sections > 0 ? (
        <span className="rounded-full bg-violet-500/20 px-2.5 py-1 text-xs font-medium text-violet-100 ring-1 ring-violet-400/30">
          {stats.sections} sections
        </span>
      ) : null}
      {stats.branches > 0 ? (
        <span className="rounded-full bg-amber-500/20 px-2.5 py-1 text-xs font-medium text-amber-100 ring-1 ring-amber-400/30">
          {stats.branches} branches
        </span>
      ) : null}
      <button
        type="button"
        onClick={onFitView}
        className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-semibold text-white ring-1 ring-white/15 transition hover:bg-white/20"
      >
        <Maximize2 className="h-3.5 w-3.5" aria-hidden />
        Fit view
      </button>
      {hasSelection ? (
        <button
          type="button"
          onClick={onClearSelection}
          className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 shadow-sm transition hover:bg-slate-100"
        >
          <X className="h-3.5 w-3.5" aria-hidden />
          Clear
        </button>
      ) : null}
    </div>
  </div>
);

export const FlowMapCanvasLegend = ({ stepCount }: { stepCount: number }) => (
  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/80 bg-slate-50/90 px-4 py-2.5 sm:px-5">
    <div className="flex flex-wrap gap-2">
      {Object.entries(FLOW_MAP_KIND_THEMES).map(([kind, theme]) => {
        const Icon = theme.icon;
        return (
          <span
            key={kind}
            className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-600 shadow-sm"
          >
            <span
              className={`inline-flex h-5 w-5 items-center justify-center rounded-md bg-gradient-to-br ${theme.gradient}`}
            >
              <Icon className="h-3 w-3 text-white" aria-hidden />
            </span>
            {theme.label}
          </span>
        );
      })}
    </div>
    <p className="text-[11px] text-slate-500">
      {stepCount > 10
        ? 'Large flow — starts zoomed in · pan to explore · Fit view shows all'
        : 'Click a node to inspect · Scroll to zoom · Drag to pan'}
    </p>
  </div>
);
