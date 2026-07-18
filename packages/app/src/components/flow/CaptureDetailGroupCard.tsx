import type { CaptureDetailGroup } from "./captureEnvironmentDisplay";
import { CaptureFieldLabel } from "./CaptureFieldLabel";
import {
  CaptureSessionBadge,
  CaptureSessionBadgeList,
} from "./CaptureSessionBadge";

const detailCardClass =
  "rounded-2xl border border-slate-200/80 bg-white/70 p-4 shadow-sm";

interface CaptureDetailGroupCardProps {
  group: CaptureDetailGroup;
}

function shouldSplitValues(label: string): boolean {
  return label === "Languages";
}

export const CaptureDetailGroupCard = ({
  group,
}: CaptureDetailGroupCardProps) => (
  <div className={detailCardClass}>
    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
      {group.title}
    </p>
    <dl className="mt-3 flex flex-wrap gap-5 justify-between">
      {group.items.map((item) => (
        <div key={item.label} className="min-w-0">
          <CaptureFieldLabel label={item.label} />
          <dd className="mt-2">
            <CaptureSessionBadgeList
              label={item.label}
              value={item.value}
              splitOnComma={shouldSplitValues(item.label)}
            />
          </dd>
        </div>
      ))}
    </dl>
  </div>
);

interface CaptureUserAgentCardProps {
  userAgent: string;
}

export const CaptureUserAgentCard = ({
  userAgent,
}: CaptureUserAgentCardProps) => (
  <div className={detailCardClass}>
    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
      User agent string
    </p>
    <div className="mt-3">
      <CaptureSessionBadge variant="mono">{userAgent}</CaptureSessionBadge>
    </div>
  </div>
);
