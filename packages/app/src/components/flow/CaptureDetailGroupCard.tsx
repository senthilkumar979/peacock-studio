import type { CaptureDetailGroup } from './captureEnvironmentDisplay';
import { CaptureFieldLabel } from './CaptureFieldLabel';

const detailCardClass =
  'rounded-2xl border border-slate-200/80 bg-white/70 p-4 shadow-sm';

interface CaptureDetailGroupCardProps {
  group: CaptureDetailGroup;
}

export const CaptureDetailGroupCard = ({ group }: CaptureDetailGroupCardProps) => (
  <div className={detailCardClass}>
    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
      {group.title}
    </p>
    <dl className="mt-3 grid gap-4 sm:grid-cols-3">
      {group.items.map((item) => (
        <div key={item.label} className="min-w-0">
          <CaptureFieldLabel label={item.label} />
          <dd className="mt-0.5 break-words text-sm font-medium text-slate-900">{item.value}</dd>
        </div>
      ))}
    </dl>
  </div>
);

interface CaptureUserAgentCardProps {
  userAgent: string;
}

export const CaptureUserAgentCard = ({ userAgent }: CaptureUserAgentCardProps) => (
  <div className={detailCardClass}>
    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
      User agent string
    </p>
    <p className="mt-3 break-all font-mono text-xs leading-relaxed text-slate-600">{userAgent}</p>
  </div>
);
