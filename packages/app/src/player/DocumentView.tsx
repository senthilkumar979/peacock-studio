import { AppHeader } from "@/components/AppHeader";
import { getPlayableSteps, isFlowSection, isFlowStep } from "@peacock/shared";
import { useFlowStore } from "@/store/flowStore";
import { formatFlowDate } from "@/utils/formatFlowDate";
import {
  getDocumentStepAnchor,
  type SharedDocumentViewMode,
} from "@/utils/shareLink";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { DocumentSectionCard } from "./DocumentSectionCard";
import { DocumentStepCard } from "./DocumentStepCard";
import { DocumentStepIndex, type DocumentStepIndexItem } from "./DocumentStepIndex";
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
  const playableStepCount = useMemo(() => getPlayableSteps(steps).length, [steps]);

  const indexItems = useMemo((): DocumentStepIndexItem[] => {
    let stepNumber = 0;
    return steps.map((item) => {
      const anchorId = getDocumentStepAnchor(item.id);
      if (isFlowSection(item)) {
        return {
          type: 'section' as const,
          anchorId,
          sectionId: item.id,
          title: item.title,
        };
      }
      stepNumber += 1;
      return {
        type: 'step' as const,
        anchorId,
        stepId: item.id,
        stepNumber,
        title: item.title,
      };
    });
  }, [steps]);

  const [activeItemId, setActiveItemId] = useState<string | null>(steps[0]?.id ?? null);
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

  const scrollToAnchor = (anchorId: string, itemId: string) => {
    setActiveItemId(itemId);
    window.history.replaceState(null, "", `#${anchorId}`);
    window.requestAnimationFrame(() => {
      scrollStepsPaneToAnchor(anchorId);
    });
  };

  useEffect(() => {
    setActiveItemId((current) => {
      if (current && steps.some((item) => item.id === current)) return current;
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
      const target = indexItems.find((item) => item.anchorId === hash);
      if (!target) return;

      setActiveItemId(target.type === 'step' ? target.stepId : target.sectionId);
      window.requestAnimationFrame(() => {
        scrollStepsPaneToAnchor(hash, "auto");
      });
    };

    syncFromHash();
    window.addEventListener("hashchange", syncFromHash);
    return () => window.removeEventListener("hashchange", syncFromHash);
  }, [indexItems]);

  useEffect(() => {
    const elements = indexItems
      .map((item) => document.getElementById(item.anchorId))
      .filter((element): element is HTMLElement => Boolean(element));
    if (!elements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        const nextItemId = visibleEntries[0]?.target.getAttribute("data-outline-id");
        if (nextItemId) setActiveItemId(nextItemId);
      },
      {
        root: isDesktopPane ? stepsScrollRef.current : null,
        rootMargin: "-18% 0px -55% 0px",
        threshold: [0.15, 0.35, 0.6],
      },
    );

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [isDesktopPane, indexItems]);

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
              {playableStepCount} {playableStepCount === 1 ? "step" : "steps"}
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
              items={indexItems}
              activeItemId={activeItemId}
              onSelectStep={(anchorId, stepId) => scrollToAnchor(anchorId, stepId)}
              onSelectSection={(anchorId, sectionId) => scrollToAnchor(anchorId, sectionId)}
            />
          </div>

          <div className="max-h-screen overflow-y-auto">
            <div
              ref={stepsScrollRef}
              className="flex min-w-0 flex-col gap-5 pr-1 "
            >
              {(() => {
                let stepNumber = 0;
                let sectionIndex = 0;
                return steps.map((item) => {
                  const anchorId = getDocumentStepAnchor(item.id);

                  if (isFlowSection(item)) {
                    const currentSectionIndex = sectionIndex;
                    sectionIndex += 1;
                    return (
                      <div key={item.id} data-outline-id={item.id}>
                        <DocumentSectionCard
                          section={item}
                          anchorId={anchorId}
                          isActive={item.id === activeItemId}
                          sectionIndex={currentSectionIndex}
                        />
                      </div>
                    );
                  }

                  if (!isFlowStep(item)) return null;

                  stepNumber += 1;
                  return (
                    <div key={item.id} data-outline-id={item.id}>
                      <DocumentStepCard
                        documentId={documentId}
                        step={item}
                        stepNumber={stepNumber}
                        anchorId={anchorId}
                        isActive={item.id === activeItemId}
                        screenshotUrls={screenshotUrls}
                      />
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
