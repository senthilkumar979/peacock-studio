import type { FlowCaptureEnvironment } from '@peacock/shared';
import { CaptureDetailGroupCard, CaptureUserAgentCard } from './CaptureDetailGroupCard';
import { buildCaptureDetailGroups } from './captureEnvironmentDisplay';

interface CaptureEnvironmentPanelProps {
  environment: FlowCaptureEnvironment;
  compact?: boolean;
  embedded?: boolean;
  inCard?: boolean;
}

export const CaptureEnvironmentPanel = ({
  environment,
  compact = false,
  embedded = false,
  inCard = false,
}: CaptureEnvironmentPanelProps) => {
  const detailGroups = buildCaptureDetailGroups(environment);

  const panelClass = embedded
    ? ''
    : inCard
      ? `h-full ${compact ? 'p-4' : 'p-5 sm:p-6'}`
      : `rounded-2xl border border-peacock-200/60 bg-gradient-to-br from-slate-50 via-white to-peacock-50/40 ${
          compact ? 'p-4' : 'p-5 sm:p-6'
        }`;

  return (
    <section className={panelClass}>
      {!embedded ? (
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
      ) : null}

      <div className={`flex flex-col gap-4 ${embedded ? 'mt-5' : 'mt-5'}`}>
        {detailGroups.map((group) => (
          <CaptureDetailGroupCard key={group.id} group={group} />
        ))}
        <CaptureUserAgentCard userAgent={environment.userAgent} />
      </div>
    </section>
  );
};
