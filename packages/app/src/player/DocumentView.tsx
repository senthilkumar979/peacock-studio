import { AppHeader } from "@/components/AppHeader";
import {
  collectAllBranches,
  isFlowBranch,
  isFlowSection,
  isFlowStep,
  sortBranchPaths,
} from "@peacock/shared";
import { useDocumentBranchPaths } from "@/hooks/useDocumentBranchPaths";
import { useFlowStore, useViewerOutline } from "@/store/flowStore";
import { DocumentBranchCard } from "./DocumentBranchCard";
import {
  buildDocumentIndexItems,
  countDocumentViewPlayableSteps,
  getBranchRenderContext,
} from "./documentOutline";
import { DocumentLinkedPathSteps } from "./DocumentLinkedPathSteps";
import {
  FLOW_DETAILS_OUTLINE_ID,
  getDocumentFlowDetailsAnchor,
  getDocumentStepAnchor,
  type SharedDocumentViewMode,
} from "@/utils/shareLink";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { DocumentSectionCard } from "./DocumentSectionCard";
import { DocumentStepCard } from "./DocumentStepCard";
import {
  DocumentStepIndex,
  type DocumentStepIndexItem,
} from "./DocumentStepIndex";
import { getDocumentStepIndexItemId } from "./documentStepIndexTypes";
import { FlowDetailsIntro } from "./FlowDetailsIntro";
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
  const steps = useViewerOutline();
  const screenshotUrls = useFlowStore((state) => state.screenshotUrls);
  const branches = useMemo(() => collectAllBranches(steps), [steps]);
  const {
    selectedPathByBranchId,
    linkedContentByPathId,
    loadingPathIds,
    errorsByPathId,
    selectPath,
  } = useDocumentBranchPaths(branches);

  const flowDetailsAnchor = getDocumentFlowDetailsAnchor();

  const playableStepCount = useMemo(
    () =>
      countDocumentViewPlayableSteps(
        steps,
        selectedPathByBranchId,
        linkedContentByPathId,
      ),
    [steps, selectedPathByBranchId, linkedContentByPathId],
  );

  const indexItems = useMemo(
    (): DocumentStepIndexItem[] =>
      buildDocumentIndexItems({
        steps,
        flowTitle: flow?.flow.title,
        flowDetailsAnchor,
        selectedPathByBranchId,
        linkedContentByPathId,
      }),
    [
      steps,
      flow?.flow.title,
      flowDetailsAnchor,
      selectedPathByBranchId,
      linkedContentByPathId,
    ],
  );

  const [activeItemId, setActiveItemId] = useState<string | null>(
    FLOW_DETAILS_OUTLINE_ID,
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

  const scrollToAnchor = (anchorId: string, itemId: string) => {
    setActiveItemId(itemId);
    window.history.replaceState(null, "", `#${anchorId}`);
    window.requestAnimationFrame(() => {
      scrollStepsPaneToAnchor(anchorId);
    });
  };

  useEffect(() => {
    setActiveItemId((current) => {
      if (current === FLOW_DETAILS_OUTLINE_ID) return current;
      if (current && steps.some((item) => item.id === current)) return current;
      return FLOW_DETAILS_OUTLINE_ID;
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

      setActiveItemId(getDocumentStepIndexItemId(target));
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
        const nextItemId =
          visibleEntries[0]?.target.getAttribute("data-outline-id");
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

      <main className="mx-auto flex w-full max-w-8xl flex-1 flex-col gap-6 px-4 py-6 sm:px-6">
        <div
          ref={layoutRef}
          className="grid min-h-0 gap-6 lg:grid-cols-[22rem_minmax(0,1fr)]"
          style={desktopPaneHeight ? { height: desktopPaneHeight } : undefined}
        >
          <div className="min-h-0 h-full">
            <DocumentStepIndex
              items={indexItems}
              activeItemId={activeItemId}
              onSelectOverview={(anchorId, itemId) =>
                scrollToAnchor(anchorId, itemId)
              }
              onSelectStep={(anchorId, stepId) =>
                scrollToAnchor(anchorId, stepId)
              }
              onSelectSection={(anchorId, sectionId) =>
                scrollToAnchor(anchorId, sectionId)
              }
              onSelectBranch={(anchorId, branchId) =>
                scrollToAnchor(anchorId, branchId)
              }
              onSelectLinkedPath={(anchorId, itemId) =>
                scrollToAnchor(anchorId, itemId)
              }
            />
          </div>

          <div className="min-h-0 h-full overflow-y-auto">
            <div
              ref={stepsScrollRef}
              className="flex min-w-0 flex-col gap-5 pr-1 "
            >
              <div data-outline-id={FLOW_DETAILS_OUTLINE_ID}>
                <FlowDetailsIntro
                  variant="doc"
                  anchorId={flowDetailsAnchor}
                  isActive={activeItemId === FLOW_DETAILS_OUTLINE_ID}
                  title={flow?.flow.title ?? "Untitled Flow"}
                  description={flow?.flow.description ?? ""}
                  version={flow?.flow.version ?? ""}
                  captureEnvironment={flow?.metadata.captureEnvironment ?? null}
                  createdAt={flow?.metadata.createdAt}
                  stepCount={playableStepCount}
                />
              </div>

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

                  if (isFlowBranch(item)) {
                    const branchPaths = sortBranchPaths(item.paths);
                    const branchContext = getBranchRenderContext(
                      item.id,
                      branchPaths,
                      selectedPathByBranchId,
                      linkedContentByPathId,
                      loadingPathIds,
                      errorsByPathId,
                    );
                    const linkedStepCount =
                      branchContext.linkedContent?.steps.length ?? 0;
                    const linkedStartStepNumber = stepNumber + 1;

                    const branchElement = (
                      <div key={item.id} data-outline-id={item.id}>
                        <DocumentBranchCard
                          branch={item}
                          anchorId={anchorId}
                          isActive={item.id === activeItemId}
                          selectedPathId={branchContext.selectedPathId}
                          onSelectPath={(path) => selectPath(item.id, path)}
                        />
                        {branchContext.loading ? (
                          <p className="mt-4 text-sm text-slate-500">
                            Loading path steps…
                          </p>
                        ) : null}
                        {branchContext.error ? (
                          <p className="mt-4 text-sm text-amber-800">
                            {branchContext.error}
                          </p>
                        ) : null}
                        {branchContext.linkedContent &&
                        branchContext.pathLabel ? (
                          <DocumentLinkedPathSteps
                            pathId={branchContext.linkedContent.pathId}
                            pathLabel={branchContext.pathLabel}
                            steps={branchContext.linkedContent.steps}
                            screenshotUrls={
                              branchContext.linkedContent.screenshotUrls
                            }
                            targetDocumentId={
                              branchContext.linkedContent.targetDocumentId
                            }
                            startStepNumber={linkedStartStepNumber}
                            activeItemId={activeItemId}
                          />
                        ) : null}
                      </div>
                    );

                    stepNumber += linkedStepCount;
                    return branchElement;
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
