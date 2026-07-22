import { HintAnchor, type PageHintControl } from "@/components/onboarding/HintAnchor";
import { PLAYER_HINT_IDS } from "@/constants/firstTimeHints";
import {
  collectAllBranches,
  isFlowBranch,
  isFlowSection,
  isFlowStep,
  sortBranchPaths,
  type LinkedPeacockPath,
} from "@peacock/shared";
import { useDocumentBranchPaths } from "@/hooks/useDocumentBranchPaths";
import {
  scrollDocumentPaneToAnchor,
  useDocumentOutlineScrollSpy,
} from "@/hooks/useDocumentOutlineScrollSpy";
import { useDocumentHashNavigation } from "@/hooks/useDocumentHashNavigation";
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
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { FlowDocViewHeader } from "@/player/FlowDocViewHeader";
import { DocumentSectionCard } from "./DocumentSectionCard";
import { DocumentStepCard } from "./DocumentStepCard";
import {
  DocumentStepIndex,
  type DocumentStepIndexItem,
} from "./DocumentStepIndex";
import { getDocumentStepIndexItemId } from "./documentStepIndexTypes";
import { FlowDetailsOverviewLayout } from "@/components/flow/FlowDetailsOverviewLayout";

interface DocumentViewProps {
  documentId: string;
  onModeChange: (mode: SharedDocumentViewMode) => void;
  pageHints?: PageHintControl;
}

export const DocumentView = ({
  documentId,
  onModeChange,
  pageHints,
}: DocumentViewProps) => {
  const location = useLocation();
  const libraryBackState = location.state;
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
  const contentScrollRef = useRef<HTMLDivElement | null>(null);
  const indexItemsRef = useRef(indexItems);
  const scrollSpyPausedRef = useRef(false);
  const pendingPathScrollRestoreRef = useRef<number | null>(null);
  const isDesktopPane = desktopPaneHeight !== null;

  indexItemsRef.current = indexItems;

  const scrollStepsPaneToAnchor = (
    anchorId: string,
    behavior: ScrollBehavior = "smooth",
  ) => {
    scrollDocumentPaneToAnchor(contentScrollRef.current, anchorId, behavior);
  };

  const handleOutlineActiveItemChange = useCallback((itemId: string) => {
    if (scrollSpyPausedRef.current) return;
    setActiveItemId(itemId);
  }, []);

  useDocumentOutlineScrollSpy(
    contentScrollRef,
    isDesktopPane,
    handleOutlineActiveItemChange,
    indexItems.map((item) => getDocumentStepIndexItemId(item)).join("|"),
    scrollSpyPausedRef,
  );

  const handleSelectPath = useCallback(
    (branchId: string, path: LinkedPeacockPath) => {
      pendingPathScrollRestoreRef.current =
        contentScrollRef.current?.scrollTop ?? 0;
      scrollSpyPausedRef.current = true;
      selectPath(branchId, path);
      setActiveItemId(branchId);
    },
    [selectPath],
  );

  useLayoutEffect(() => {
    if (pendingPathScrollRestoreRef.current === null) return;

    const scrollTop = pendingPathScrollRestoreRef.current;
    pendingPathScrollRestoreRef.current = null;
    const scrollContainer = contentScrollRef.current;
    if (scrollContainer) scrollContainer.scrollTop = scrollTop;

    window.requestAnimationFrame(() => {
      scrollSpyPausedRef.current = false;
    });
  }, [selectedPathByBranchId, linkedContentByPathId, loadingPathIds]);

  const scrollToAnchor = (anchorId: string, itemId: string) => {
    setActiveItemId(itemId);
    window.history.replaceState(null, "", `#${anchorId}`);
    window.requestAnimationFrame(() => {
      scrollStepsPaneToAnchor(anchorId);
    });
  };

  useEffect(() => {
    setActiveItemId((current) => {
      if (!current) return FLOW_DETAILS_OUTLINE_ID;
      const isKnownItem = indexItems.some(
        (item) => getDocumentStepIndexItemId(item) === current,
      );
      if (isKnownItem) return current;
      if (steps.some((item) => isFlowBranch(item) && item.id === current)) {
        return current;
      }
      return FLOW_DETAILS_OUTLINE_ID;
    });
  }, [indexItems, steps]);

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

  useDocumentHashNavigation({
    branches,
    selectedPathByBranchId,
    linkedContentByPathId,
    selectPath,
    indexItemsRef,
    setActiveItemId,
    scrollToHash: (anchorId) => scrollStepsPaneToAnchor(anchorId, "auto"),
  });

  return (
    <div className="flex min-h-screen[calc(100vh-128px)] flex-col bg-slate-50">
      <FlowDocViewHeader
        documentId={documentId}
        title={flow?.flow.title ?? "Untitled Flow"}
        viewMode="doc"
        onViewModeChange={onModeChange}
        editHref={`/docs/${documentId}/edit`}
        editLinkState={libraryBackState}
        pageHints={pageHints}
      />

      <main className="mx-auto flex w-full max-w-8xl flex-1 flex-col gap-6 px-4 py-6 sm:px-6">
        <div
          ref={layoutRef}
          className="grid min-h-0 gap-6 lg:grid-cols-[22rem_minmax(0,1fr)]"
          style={desktopPaneHeight ? { height: desktopPaneHeight } : undefined}
        >
          <div className="min-h-0 h-full">
            <HintAnchor
              hints={pageHints}
              hintId={PLAYER_HINT_IDS.docOutline}
              title="Document outline"
              description="Jump to any section, step, or branch path. The outline stays in sync as you scroll."
              placement="bottom-start"
            >
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
            </HintAnchor>
          </div>

          <div
            ref={contentScrollRef}
            className="min-h-0 h-full overflow-y-auto"
          >
            <div className="flex min-w-0 flex-col gap-5 pr-1 ">
              <div data-outline-id={FLOW_DETAILS_OUTLINE_ID}>
                <FlowDetailsOverviewLayout
                  variant="doc"
                  documentId={documentId}
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
                          onSelectPath={(path) => handleSelectPath(item.id, path)}
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
                            documentId={documentId}
                            pathId={branchContext.linkedContent.pathId}
                            pathLabel={branchContext.pathLabel}
                            steps={branchContext.linkedContent.steps}
                            screenshotUrls={
                              branchContext.linkedContent.screenshotUrls
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
