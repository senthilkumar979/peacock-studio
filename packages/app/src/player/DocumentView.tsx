import { AppHeader } from "@/components/AppHeader";
import { useFlowStore } from "@/store/flowStore";
import { formatFlowDate } from "@/utils/formatFlowDate";
import {
  getDocumentStepAnchor,
  type SharedDocumentViewMode,
} from "@/utils/shareLink";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { DocumentStepCard } from "./DocumentStepCard";
import { DocumentStepIndex } from "./DocumentStepIndex";
import { SharedViewToggle } from "./SharedViewToggle";

interface DocumentViewProps {
  documentId: string;
  onModeChange: (mode: SharedDocumentViewMode) => void;
}

export const DocumentView = ({
  documentId,
  onModeChange,
}: DocumentViewProps) => {
  const flow = useFlowStore((state) => state.flow);
  const steps = useFlowStore((state) => state.steps);
  const screenshotUrls = useFlowStore((state) => state.screenshotUrls);
  const stepItems = useMemo(
    () =>
      steps.map((step, index) => ({
        stepId: step.id,
        stepNumber: index + 1,
        title: step.title,
        anchorId: getDocumentStepAnchor(step.id),
      })),
    [steps],
  );
  const [activeStepId, setActiveStepId] = useState<string | null>(
    steps[0]?.id ?? null,
  );
  const [desktopPaneHeight, setDesktopPaneHeight] = useState<number | null>(
    null,
  );
  const layoutRef = useRef<HTMLDivElement | null>(null);
  const stepsScrollRef = useRef<HTMLDivElement | null>(null);
  const isDesktopPane = desktopPaneHeight !== null;

  const scrollStepsPaneToAnchor = (
    anchorId: string,
    behavior: ScrollBehavior = "smooth",
  ) => {
    const stepsPane = stepsScrollRef.current;
    const target = document.getElementById(anchorId);
    if (!target) return;

    if (!stepsPane || !isDesktopPane || !stepsPane.contains(target)) {
      target.scrollIntoView({ block: "start", behavior });
      return;
    }

    target.scrollIntoView({ block: "start", behavior, inline: "nearest" });
  };

  const scrollToStep = (anchorId: string, stepId: string) => {
    setActiveStepId(stepId);
    window.history.replaceState(null, "", `#${anchorId}`);
    window.requestAnimationFrame(() => {
      scrollStepsPaneToAnchor(anchorId);
    });
  };

  useEffect(() => {
    setActiveStepId((current) => {
      if (current && steps.some((step) => step.id === current)) return current;
      return steps[0]?.id ?? null;
    });
  }, [steps]);

  useEffect(() => {
    const updateDesktopPaneHeight = () => {
      if (window.innerWidth < 1024) {
        setDesktopPaneHeight(null);
        return;
      }

      const layout = layoutRef.current;
      if (!layout) {
        setDesktopPaneHeight(null);
        return;
      }

      const rect = layout.getBoundingClientRect();
      const availableHeight = Math.floor(window.innerHeight - rect.top - 24);
      setDesktopPaneHeight(Math.max(320, availableHeight));
    };

    updateDesktopPaneHeight();
    window.addEventListener("resize", updateDesktopPaneHeight);
    return () => window.removeEventListener("resize", updateDesktopPaneHeight);
  }, [steps.length]);

  useEffect(() => {
    const syncFromHash = () => {
      const hash = window.location.hash.replace(/^#/, "");
      if (!hash) return;
      const target = stepItems.find((item) => item.anchorId === hash);
      if (!target) return;

      setActiveStepId(target.stepId);
      window.requestAnimationFrame(() => {
        scrollStepsPaneToAnchor(hash, "auto");
      });
    };

    syncFromHash();
    window.addEventListener("hashchange", syncFromHash);
    return () => window.removeEventListener("hashchange", syncFromHash);
  }, [stepItems]);

  useEffect(() => {
    const elements = stepItems
      .map((item) => document.getElementById(item.anchorId))
      .filter((element): element is HTMLElement => Boolean(element));
    if (!elements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        const nextStepId =
          visibleEntries[0]?.target.getAttribute("data-step-id");
        if (nextStepId) setActiveStepId(nextStepId);
      },
      {
        root: isDesktopPane ? stepsScrollRef.current : null,
        rootMargin: "-18% 0px -55% 0px",
        threshold: [0.15, 0.35, 0.6],
      },
    );

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [isDesktopPane, stepItems]);

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <AppHeader
        eyebrow="Peacock Shared Guide"
        title={flow?.flow.title ?? "Untitled Flow"}
        description={flow?.flow.description || undefined}
        homeLink
        documentId={documentId}
      >
        <SharedViewToggle mode="doc" onChange={onModeChange} />
        <Link
          to={`/docs/${documentId}/edit`}
          className="rounded-lg border border-peacock-200 bg-peacock-50 px-3 py-2 text-sm font-medium text-peacock-800 hover:bg-peacock-100"
        >
          Edit flow
        </Link>
      </AppHeader>

      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-6 sm:px-6">
        <section className="shrink-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap gap-3 text-sm text-slate-600">
            <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 font-medium">
              {steps.length} {steps.length === 1 ? "step" : "steps"}
            </span>
            {flow ? (
              <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 font-medium">
                Created {formatFlowDate(flow.metadata.createdAt)}
              </span>
            ) : null}
          </div>
          <p className="mt-4 text-sm leading-6 text-slate-600">
            Follow the documented steps below, or switch to player mode for a
            guided walkthrough.
          </p>
        </section>

        <div
          ref={layoutRef}
          className={`grid gap-6 lg:grid-cols-[16rem_minmax(0,1fr)] ${isDesktopPane ? "" : ""}`}
          style={desktopPaneHeight ? { height: desktopPaneHeight } : undefined}
        >
          <div className="sticky">
            <DocumentStepIndex
              items={stepItems}
              activeStepId={activeStepId}
              onSelect={scrollToStep}
            />
          </div>

          <div className="max-h-screen overflow-y-auto">
            <div
              ref={stepsScrollRef}
              className="flex min-w-0 flex-col gap-5 pr-1 "
            >
              {steps.map((step, index) => (
                <DocumentStepCard
                  key={step.id}
                  documentId={documentId}
                  step={step}
                  stepNumber={index + 1}
                  anchorId={
                    stepItems[index]?.anchorId ?? getDocumentStepAnchor(step.id)
                  }
                  isActive={step.id === activeStepId}
                  screenshotUrls={screenshotUrls}
                />
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
