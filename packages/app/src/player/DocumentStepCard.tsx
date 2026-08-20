import { useState } from "react";
import { Check, Link2 } from "lucide-react";
import type { FlowStep } from "@peacock/shared";
import { getStepMarkerPosition, getStepResourcesForStep, getStepUrl, resolveStepDescription } from "@peacock/shared";
import { RichTextContent } from "@/components/editor/RichTextContent";
import { StepResourceList } from "@/components/flow/StepResourceList";
import { usePlayerStepDetailsVisibility } from "@/hooks/usePlayerStepDetailsVisibility";
import { getDocumentAnchorShareUrl } from "@/utils/shareLink";
import { isEmptyRichText } from "@/utils/richText";
import { useFlowStore } from "@/store/flowStore";
import { BrowserMockup } from "./BrowserMockup";
import { PlayerClickMarker } from "./PlayerClickMarker";
import { getEventTypeIcon, getEventTypeLabel } from "./eventTypeDisplay";
import { getStepScreenshotUrl } from "@/store/flowStore";

interface DocumentStepCardProps {
  documentId: string;
  step: FlowStep;
  stepNumber: number;
  anchorId: string;
  isActive: boolean;
  screenshotUrls: Record<string, string>;
}

export const DocumentStepCard = ({
  documentId,
  step,
  stepNumber,
  anchorId,
  isActive,
  screenshotUrls,
}: DocumentStepCardProps) => {
  const screenshotUrl = getStepScreenshotUrl(step, screenshotUrls);
  const markerPosition = getStepMarkerPosition(step);
  const stepUrl = getStepUrl(step);
  const description = resolveStepDescription(step);
  const stepResources = useFlowStore((state) => state.stepResources);
  const resources = getStepResourcesForStep(stepResources, step.id);
  const hasDetailedDescription = !isEmptyRichText(step.detailedDescription ?? "");
  const { isDetailsVisible, toggleDetails } = usePlayerStepDetailsVisibility(
    step.id,
  );
  const [copyMessage, setCopyMessage] = useState<"idle" | "copied" | "failed">(
    "idle",
  );
  const EventTypeIcon = getEventTypeIcon(step.event.type);

  const handleCopyStepLink = async () => {
    try {
      await navigator.clipboard.writeText(
        getDocumentAnchorShareUrl(documentId, anchorId),
      );
      setCopyMessage("copied");
      window.setTimeout(() => setCopyMessage("idle"), 2000);
    } catch {
      setCopyMessage("failed");
      window.setTimeout(() => setCopyMessage("idle"), 2000);
    }
  };

  return (
    <article
      id={anchorId}
      data-step-id={step.id}
      className={`scroll-mt-24 overflow-hidden rounded-2xl border-2 bg-white shadow-sm transition duration-200 ${
        isActive
          ? "border-peacock-500 shadow-lg shadow-peacock-500/15 ring-4 ring-peacock-200/70"
          : "border-slate-200"
      }`}
    >
      <div
        className={`flex flex-wrap items-center justify-between gap-3 border-b px-5 py-4 ${
          isActive
            ? "border-peacock-200 bg-peacock-100/90"
            : "border-slate-100 bg-peacock-50"
        }`}
      >
        <div className="min-w-0">
          <p
            className={`text-xs font-semibold uppercase tracking-[0.18em] ${
              isActive ? "text-peacock-800" : "text-peacock-600"
            }`}
          >
            Step {stepNumber}
          </p>
          <h2 className="mt-1 text-lg font-semibold text-slate-900">
            {step.title}
          </h2>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
            <EventTypeIcon className="h-3.5 w-3.5 shrink-0" aria-hidden />
            {getEventTypeLabel(step.event.type)}
          </span>
          <button
            type="button"
            onClick={() => void handleCopyStepLink()}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
          >
            {copyMessage === "copied" ? (
              <Check className="h-3.5 w-3.5" aria-hidden />
            ) : (
              <Link2 className="h-3.5 w-3.5" aria-hidden />
            )}
            {copyMessage === "copied"
              ? "Copied"
              : copyMessage === "failed"
                ? "Copy failed"
                : "Copy step link"}
          </button>
        </div>
      </div>

      <div className="space-y-5 p-5">
        <div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Instructions
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-700">
              {description ||
                "No additional instructions were added for this step."}
            </p>
          </div>
          {hasDetailedDescription ? (
            <div className="mt-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Detailed description
              </p>
              <RichTextContent
                html={step.detailedDescription ?? ""}
                className="prose prose-sm mt-2 max-w-none text-slate-700"
              />
            </div>
          ) : null}
          <StepResourceList resources={resources} className="mt-4" />
        </div>

        <div className="min-w-0">
          <BrowserMockup url={stepUrl} isFluid>
            {screenshotUrl ? (
              <div className="relative p-3 sm:p-4">
                <img
                  src={screenshotUrl}
                  alt={step.title}
                  className="block h-auto w-full object-contain"
                />
                {markerPosition ? (
                  <PlayerClickMarker
                    step={step}
                    stepNumber={stepNumber}
                    xPercent={markerPosition.xPercent}
                    yPercent={markerPosition.yPercent}
                    isDetailsVisible={isDetailsVisible}
                    onToggle={toggleDetails}
                  />
                ) : null}
              </div>
            ) : (
              <div className="flex min-h-[240px] items-center justify-center px-6 py-10 text-sm text-slate-500">
                {step.event.type === "navigation"
                  ? "Navigation step - no screenshot"
                  : "Screenshot unavailable"}
              </div>
            )}
          </BrowserMockup>
        </div>
      </div>
    </article>
  );
};
