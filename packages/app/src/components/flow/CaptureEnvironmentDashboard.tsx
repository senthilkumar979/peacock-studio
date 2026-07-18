import type { FlowCaptureEnvironment } from "@peacock/shared";
import { Clock, Monitor, ScanSearch } from "lucide-react";
import {
  CaptureDetailGroupCard,
  CaptureUserAgentCard,
} from "@/components/flow/CaptureDetailGroupCard";
import { CaptureSessionBadge } from "@/components/flow/CaptureSessionBadge";
import {
  buildCaptureDetailGroups,
  buildCaptureHighlights,
} from "@/components/flow/captureEnvironmentDisplay";

interface CaptureEnvironmentDashboardProps {
  environment: FlowCaptureEnvironment;
}

export const CaptureEnvironmentDashboard = ({
  environment,
}: CaptureEnvironmentDashboardProps) => {
  const highlights = buildCaptureHighlights(environment);
  const detailGroups = buildCaptureDetailGroups(environment);

  const browser = highlights.find((item) => item.id === "browser");
  const os = highlights.find((item) => item.id === "os");
  const duration = highlights.find((item) => item.id === "duration");

  const osBadgeLabel = [os?.value ?? "OS", os?.detail]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="flex flex-col gap-4">
      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 p-4 text-white shadow-inner sm:p-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-peacock-300">
          Recording session
        </p>
        <div className="mt-4 flex flex-wrap gap-2 justify-between">
          <div className="flex items-center gap-2">
            <ScanSearch
              className="h-6 w-6 shrink-0 text-peacock-300"
              aria-hidden
            />
            {browser?.detail ? (
              <CaptureSessionBadge variant="dark">
                {browser?.value ?? "Browser"} v {browser.detail}
              </CaptureSessionBadge>
            ) : null}
          </div>
          <span className="inline-flex items-center gap-1.5">
            <Monitor className="h-3.5 w-3.5 text-peacock-300" aria-hidden />
            <CaptureSessionBadge variant="dark">
              {osBadgeLabel}
            </CaptureSessionBadge>
          </span>
          {duration ? (
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-peacock-300" aria-hidden />
              <CaptureSessionBadge variant="dark">
                {duration.value}
              </CaptureSessionBadge>
            </span>
          ) : null}
        </div>
      </div>

      {detailGroups.map((group) => (
        <CaptureDetailGroupCard key={group.id} group={group} />
      ))}
      <CaptureUserAgentCard userAgent={environment.userAgent} />
    </div>
  );
};
