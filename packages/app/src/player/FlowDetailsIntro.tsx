import type { FlowCaptureEnvironment } from "@peacock/shared";
import { FileText } from "lucide-react";
import { FlowVersionBadge } from "@/components/dashboard/FlowVersionBadge";
import { CaptureEnvironmentPanel } from "@/components/flow/CaptureEnvironmentPanel";
import { formatFlowDate } from "@/utils/formatFlowDate";

interface FlowDetailsIntroProps {
  title: string;
  description: string;
  version: string;
  captureEnvironment?: FlowCaptureEnvironment | null;
  createdAt?: number;
  stepCount?: number;
  variant: "doc" | "player";
  anchorId?: string;
  isActive?: boolean;
}

const introCardClass =
  "h-full rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6";

interface FlowDetailsSummaryProps {
  title: string;
  trimmedDescription: string;
  version: string;
  stepCount?: number;
  createdAt?: number;
  isPlayer: boolean;
  showEyebrow?: boolean;
}

const FlowDetailsSummary = ({
  title,
  trimmedDescription,
  version,
  stepCount,
  createdAt,
  isPlayer,
  showEyebrow = false,
}: FlowDetailsSummaryProps) => (
  <>
    {showEyebrow ? (
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-peacock-600">
        Flow details
      </p>
    ) : null}

    <h2
      className={
        isPlayer
          ? "text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl"
          : "mt-1 text-xl font-semibold text-slate-900"
      }
    >
      {title}
    </h2>

    {trimmedDescription ? (
      <p
        className={
          isPlayer
            ? "mt-3 text-base leading-relaxed text-slate-700 sm:text-lg"
            : "mt-3 text-sm leading-6 text-slate-600"
        }
      >
        {trimmedDescription}
      </p>
    ) : (
      <p className="mt-3 text-sm italic text-slate-500">
        No description provided.
      </p>
    )}

    <div className="mt-5 flex flex-col gap-3">
      <FlowVersionBadge version={version} />
      <div className="flex flex-wrap items-center gap-3">
        {typeof stepCount === "number" ? (
          <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-600">
            {stepCount} {stepCount === 1 ? "step" : "steps"}
          </span>
        ) : null}
        {createdAt ? (
          <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-600">
            Created {formatFlowDate(createdAt)}
          </span>
        ) : null}
      </div>
    </div>
  </>
);

export const FlowDetailsIntro = ({
  title,
  description,
  version,
  captureEnvironment,
  createdAt,
  stepCount,
  variant,
  anchorId,
  isActive = false,
}: FlowDetailsIntroProps) => {
  const trimmedDescription = description.trim();
  const isPlayer = variant === "player";
  const hasEnvironment = Boolean(captureEnvironment);

  const summaryProps = {
    title,
    trimmedDescription,
    version,
    stepCount,
    createdAt,
    isPlayer,
  };

  if (isPlayer) {
    return (
      <div className="mx-auto w-full max-w-6xl">
        <div
          className={`grid gap-6 lg:items-stretch lg:gap-8 ${hasEnvironment ? "lg:grid-cols-2" : ""}`}
        >
          <div className={`min-w-0 ${introCardClass}`}>
            <span className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-peacock-200 bg-peacock-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-peacock-800">
              <FileText className="h-3.5 w-3.5" aria-hidden />
              Flow overview
            </span>
            <FlowDetailsSummary {...summaryProps} />
            <p className="mt-6 text-sm text-slate-500">
              Press Next or use the arrow keys to begin the guided walkthrough.
            </p>
          </div>

          {captureEnvironment ? (
            <div className="min-w-0">
              <CaptureEnvironmentPanel
                environment={captureEnvironment}
                compact
              />
            </div>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <section
      id={anchorId}
      className={`scroll-mt-24 rounded-2xl border bg-white p-6 shadow-sm transition ${
        isActive
          ? "border-peacock-300 ring-2 ring-peacock-100"
          : "border-slate-200"
      }`}
    >
      <FlowDetailsSummary {...summaryProps} showEyebrow />

      {captureEnvironment ? (
        <div className="mt-6">
          <CaptureEnvironmentPanel environment={captureEnvironment} />
        </div>
      ) : null}

      <p className="mt-6 text-sm text-slate-500">
        Follow the documented steps below, or switch to player mode for a guided
        walkthrough.
      </p>
    </section>
  );
};
