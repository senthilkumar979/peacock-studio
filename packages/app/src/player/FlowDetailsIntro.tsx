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

  const content = (
    <>
      <div className="mt-5">
        <h2
          className={
            isPlayer
              ? "text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl"
              : "text-xl font-semibold text-slate-900"
          }
        >
          {title}
        </h2>
        {trimmedDescription ? (
          <p
            className={
              isPlayer
                ? "mt-1 text-base leading-relaxed text-slate-700 sm:text-lg"
                : "mt-1 text-sm leading-6 text-slate-600"
            }
          >
            {trimmedDescription}
          </p>
        ) : (
          <p className="mt-3 text-sm italic text-slate-500">
            No description provided.
          </p>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3 mt-2">
        <FlowVersionBadge version={version} />
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

      {captureEnvironment ? (
        <div className="mt-6">
          <CaptureEnvironmentPanel
            environment={captureEnvironment}
            compact={isPlayer}
          />
        </div>
      ) : null}
    </>
  );

  if (isPlayer) {
    return (
      <article className="relative mx-auto w-full max-w-3xl overflow-hidden rounded-3xl border border-peacock-200/70 bg-white shadow-xl shadow-peacock-100/40">
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-br from-peacock-50 via-white to-brand-violet/5"
          aria-hidden
        />
        <div className="relative z-10 px-6 py-8 sm:px-10 sm:py-10">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-peacock-200 bg-peacock-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-peacock-800">
            <FileText className="h-3.5 w-3.5" aria-hidden />
            Flow overview
          </span>
          {content}
        </div>
      </article>
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
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-peacock-600">
        Flow details
      </p>
      {content}
    </section>
  );
};
