import { Clock, Globe2, Monitor, ScanSearch } from 'lucide-react';
import type { CaptureHighlight } from './captureEnvironmentDisplay';

const HIGHLIGHT_ICONS: Record<string, typeof Monitor> = {
  os: Monitor,
  browser: ScanSearch,
  duration: Clock,
};

interface CaptureHighlightCardProps {
  highlight: CaptureHighlight;
  compact: boolean;
}

export const CaptureHighlightCard = ({ highlight, compact }: CaptureHighlightCardProps) => {
  const Icon = HIGHLIGHT_ICONS[highlight.id] ?? Globe2;

  return (
    <div
      className={`rounded-2xl border border-white/80 bg-white/80 shadow-sm ring-1 ring-slate-200/70 backdrop-blur-sm ${
        compact ? 'p-2.5' : 'p-3 sm:p-4'
      }`}
    >
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-peacock-50 to-brand-violet/10 text-peacock-700 ring-1 ring-peacock-100">
          <Icon className="h-4 w-4" aria-hidden />
        </span>
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
            {highlight.label}
          </p>
          <p className="mt-1 truncate text-sm font-semibold text-slate-900">{highlight.value}</p>
          {highlight.detail ? (
            <p className="mt-0.5 truncate font-mono text-xs text-slate-500">{highlight.detail}</p>
          ) : null}
        </div>
      </div>
    </div>
  );
};
