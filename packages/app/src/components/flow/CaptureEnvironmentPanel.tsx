import type { FlowCaptureEnvironment } from '@peacock/shared';
import { CaptureDetailGroupCard, CaptureUserAgentCard } from './CaptureDetailGroupCard';
import { CaptureHighlightCard } from './CaptureHighlightCard';
import {
  buildCaptureDetailGroups,
  buildCaptureHighlights,
} from './captureEnvironmentDisplay';

interface CaptureEnvironmentPanelProps {
  environment: FlowCaptureEnvironment;
  compact?: boolean;
}

export const CaptureEnvironmentPanel = ({
  environment,
  compact = false,
}: CaptureEnvironmentPanelProps) => {
  const highlights = buildCaptureHighlights(environment);
  const detailGroups = buildCaptureDetailGroups(environment);

  return (
    <section
      className={`rounded-2xl border border-peacock-200/60 bg-gradient-to-br from-slate-50 via-white to-peacock-50/40 ${
        compact ? 'p-4' : 'p-5 sm:p-6'
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-peacock-700">
            Captured environment
          </p>
          {!compact ? (
            <p className="mt-1 max-w-xl text-sm text-slate-600">
              Snapshot of the browser and device used when this flow was recorded.
            </p>
          ) : null}
        </div>
        <span className="inline-flex items-center rounded-full border border-peacock-200/80 bg-white/80 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-peacock-700">
          Session metadata
        </span>
      </div>

      <div className={`mt-5 grid gap-3 sm:grid-cols-2 ${compact ? '' : 'xl:grid-cols-4'}`}>
        {highlights.map((highlight) => (
          <CaptureHighlightCard
            key={highlight.id}
            highlight={highlight}
            deviceCategory={environment.device.category}
            compact={compact}
          />
        ))}
      </div>

      <div className="mt-5 flex flex-col gap-4">
        {detailGroups.map((group) => (
          <CaptureDetailGroupCard key={group.id} group={group} />
        ))}
        <CaptureUserAgentCard userAgent={environment.userAgent} />
      </div>
    </section>
  );
};
