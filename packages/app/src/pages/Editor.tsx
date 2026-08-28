import { useEffect, useMemo, useState } from "react";
import { flushSync } from "react-dom";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { trackEvent } from "@/analytics/analyticsClient";
import { AnalyticsEvents } from "@/analytics/events";
import { DASHBOARD_PATH } from "@/constants/routes";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { FirstCaptureChecklist } from "@/components/onboarding/FirstCaptureChecklist";
import { PendingCaptureBar } from "@/components/onboarding/PendingCaptureBar";
import { FirstTimeTooltip } from "@/components/onboarding/FirstTimeTooltip";
import {
  EDITOR_HINT_IDS,
  getEditorHintSequence,
  getHintStepLabel,
} from "@/constants/firstTimeHints";
import { useFirstTimeHintTour } from "@/hooks/useFirstTimeHint";
import type { EditorHintControl } from "@/editor/editorHintControl";
import { Canvas } from "@/editor/Canvas";
import { BranchPanel } from "@/editor/BranchPanel";
import { FlowBranchCard } from "@/editor/FlowBranchCard";
import { LinkPeacockDocModal } from "@/editor/LinkPeacockDocModal";
import { GuestDocumentGate } from "@/components/auth/GuestDocumentGate";
import { CaptureDesktopRequired } from "@/components/extension/CaptureDesktopRequired";
import { ChromeWebStoreLink } from "@/components/extension/ChromeWebStoreLink";
import { AppErrorBoundary } from "@/components/errors/AppErrorBoundary";
import { StepScreenshotEditorProvider } from "@/editor/StepScreenshotEditorProvider";
import { ResourceNotFoundPage } from "@/components/errors/ResourceNotFoundPage";
import { StepList } from "@/editor/StepList";
import { StepPanel } from "@/editor/StepPanel";
import { Toolbar } from "@/editor/Toolbar";
import { usePayload } from "@/hooks/usePayload";
import { useHydrateResourceLabels } from "@/hooks/useHydrateResourceLabels";
import { usePersistDocument } from "@/hooks/usePersistDocument";
import { useSavedDocument } from "@/hooks/useSavedDocument";
import {
  persistCurrentFlow,
  saveNewFlowFromStore,
} from "@/services/flowLibraryService";
import {
  useFlowStore,
  usePlayableSteps,
  useSelectedBranch,
  useSelectedSection,
  useSelectedStep,
} from "@/store/flowStore";
import { SectionPanel } from "@/editor/SectionPanel";
import { FlowSectionCard } from "@/components/FlowSectionCard";
import { PeacockStudioLoader } from "@/components/PeacockStudioLoader";
import { isCaptureUnsupportedClient } from "@/utils/isCaptureUnsupportedClient";
import { notifyPersistError } from "@/utils/notify";

const EXTENSION_HANDOFF_TIMEOUT_MS = 20_000;

export const Editor = () => {
  const { documentId } = useParams<{ documentId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const isExtensionHandoff = !documentId;
  const captureUnsupported = isExtensionHandoff && isCaptureUnsupportedClient();
  const [showFirstCaptureChecklist, setShowFirstCaptureChecklist] = useState(
    () =>
      Boolean(
        (location.state as { justCreated?: boolean } | null)?.justCreated,
      ),
  );
  const [isSavingPendingCapture, setIsSavingPendingCapture] = useState(false);
  const [isDiscardDialogOpen, setIsDiscardDialogOpen] = useState(false);

  const payload = usePayload({
    enabled: isExtensionHandoff && !captureUnsupported,
  });
  const saved = useSavedDocument(documentId);

  const { isLoading, isLoaded, error } = isExtensionHandoff ? payload : saved;
  const documentIdFromStore = useFlowStore((state) => state.documentId);
  const resetFlow = useFlowStore((state) => state.resetFlow);
  const resolvedDocumentId = documentId ?? documentIdFromStore;
  const isPendingCapture = isLoaded && !resolvedDocumentId;
  // Keep the bar mounted while saving: saveNewFlowFromStore sets documentId
  // synchronously, which would otherwise unmount the loader immediately.
  const showPendingCaptureBar = isPendingCapture || isSavingPendingCapture;

  usePersistDocument(Boolean(documentId && isLoaded), documentId);
  useHydrateResourceLabels(isLoaded, false);

  useEffect(() => {
    if (!documentId || !isLoaded) return;
    trackEvent(AnalyticsEvents.editorOpened, { document_id: documentId });
  }, [documentId, isLoaded]);

  const selectedStep = useSelectedStep();
  const selectedSection = useSelectedSection();
  const selectedBranch = useSelectedBranch();
  const playableSteps = usePlayableSteps();
  const addPathToBranch = useFlowStore((state) => state.addPathToBranch);
  const addBranchWithPath = useFlowStore((state) => state.addBranchWithPath);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [linkMode, setLinkMode] = useState<"new" | "add-path">("new");
  const [editorHintsReady, setEditorHintsReady] = useState(false);
  const [handoffTimedOut, setHandoffTimedOut] = useState(false);

  useEffect(() => {
    if (!isExtensionHandoff || captureUnsupported || !isLoading) {
      setHandoffTimedOut(false);
      return;
    }
    const timer = window.setTimeout(() => {
      setHandoffTimedOut(true);
    }, EXTENSION_HANDOFF_TIMEOUT_MS);
    return () => window.clearTimeout(timer);
  }, [captureUnsupported, isExtensionHandoff, isLoading]);

  const editorHintSequence = useMemo(
    () =>
      getEditorHintSequence({
        canBranch: isLoaded,
        canPlay: Boolean(resolvedDocumentId),
        canUseToolbarActions: playableSteps.length > 0,
      }),
    [isLoaded, playableSteps.length, resolvedDocumentId],
  );

  const { activeHintId, dismissHint, skipAllHints } = useFirstTimeHintTour(
    editorHintSequence,
    {
      ready: isLoaded && editorHintsReady,
    },
  );

  const editorHints: EditorHintControl = useMemo(
    () => ({
      activeHintId,
      hintStep: (hintId) => getHintStepLabel(hintId, editorHintSequence),
      dismissHint,
      skipAllHints,
    }),
    [activeHintId, dismissHint, editorHintSequence, skipAllHints],
  );

  const openLinkModal = (mode: "new" | "add-path") => {
    setLinkMode(mode);
    setIsLinkModalOpen(true);
  };

  const handleSavePendingCapture = async () => {
    flushSync(() => {
      setIsSavingPendingCapture(true);
    });
    try {
      const savedDocumentId = await saveNewFlowFromStore();
      if (!savedDocumentId) {
        notifyPersistError(
          new Error("Recording had no steps to save."),
          "Save documentation",
        );
        return;
      }
      trackEvent(AnalyticsEvents.documentCreated, {
        document_id: savedDocumentId,
        source: "pending_capture",
      });
      navigate(`/docs/${savedDocumentId}/edit`, {
        replace: true,
        state: { justCreated: true },
      });
    } catch (saveError) {
      notifyPersistError(saveError, "Save documentation");
    } finally {
      setIsSavingPendingCapture(false);
    }
  };

  const handleDiscardPendingCapture = () => {
    resetFlow();
    setIsDiscardDialogOpen(false);
    navigate(DASHBOARD_PATH, { replace: true });
  };

  if (captureUnsupported) {
    return <CaptureDesktopRequired variant="card" surface="editor" />;
  }

  if (error) {
    return (
      <ResourceNotFoundPage
        title={
          isExtensionHandoff
            ? "Could not load capture"
            : "Documentation not found"
        }
        description={error}
      />
    );
  }

  if (isLoading) {
    if (isExtensionHandoff && handoffTimedOut) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 p-8">
          <div className="max-w-md rounded-xl border border-slate-200 bg-white p-6 text-center shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">
              Still waiting for the extension
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Make sure Peacock Studio is installed and pinned, then start a
              recording on any site and stop it to open the editor. If a
              recording already finished, try stopping again or refresh this
              page.
            </p>
            <div className="mt-5 flex flex-col items-center gap-3">
              <ChromeWebStoreLink className="inline-flex items-center gap-2 rounded-xl bg-peacock-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-peacock-800" />
              <Link
                to={DASHBOARD_PATH}
                className="text-sm font-medium text-peacock-700 hover:text-peacock-800"
              >
                Back to dashboard
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50">
        <PeacockStudioLoader size={160} />
        <p className="text-sm text-slate-500">
          {isExtensionHandoff
            ? "Waiting for flow from extension. Please don't refresh or close this page."
            : "Loading documentation…"}
        </p>
      </div>
    );
  }

  if (!isLoaded) {
    if (documentId) {
      return (
        <ResourceNotFoundPage
          title="Documentation not found"
          description="This documentation was not found. It may have been deleted."
        />
      );
    }

    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-8">
        <div className="max-w-md rounded-xl border border-slate-200 bg-white p-6 text-center shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">
            No flow loaded
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Record steps with the Peacock extension, then stop recording to open
            the editor.
          </p>
          <Link to={DASHBOARD_PATH} className="btn-peacock mt-4">
            Back to dashboard
          </Link>
        </div>
      </div>
    );
  }

  const handleLinkConfirm = async (input: {
    targetDocumentId: string;
    targetTitle: string;
    targetDescription: string;
    fromStepId: string;
    toStepId: string;
    label: string;
  }) => {
    if (linkMode === "add-path" && selectedBranch) {
      addPathToBranch(selectedBranch.id, input);
    } else {
      addBranchWithPath(input);
    }
    const id = documentId ?? documentIdFromStore;
    if (id) await persistCurrentFlow(id);
  };

  const editorBody = (
    <StepScreenshotEditorProvider>
    <AppErrorBoundary
      compact
      title="Editor crashed"
      description="A rendering error stopped the editor. You can retry this view or return to your dashboard."
    >
      <div className="relative flex h-screen flex-col overflow-hidden">
        <Toolbar
          documentId={documentId}
          onEditorHintsReady={setEditorHintsReady}
          editorHints={editorHints}
        />

        {showPendingCaptureBar ? (
          <PendingCaptureBar
            isSaving={isSavingPendingCapture}
            onSave={() => {
              void handleSavePendingCapture();
            }}
            onDiscard={() => setIsDiscardDialogOpen(true)}
          />
        ) : null}

        {showFirstCaptureChecklist && !showPendingCaptureBar ? (
          <FirstCaptureChecklist
            onDismiss={() => setShowFirstCaptureChecklist(false)}
          />
        ) : null}
        <div className="grid min-h-0 flex-1 grid-cols-[280px_1fr_320px] gap-4 p-4">
          <aside className="flex min-h-0 flex-col overflow-hidden rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200">
            <StepList
              onLinkPeacockDoc={() => openLinkModal("new")}
              editorHints={editorHints}
            />
          </aside>
          <main className="flex min-h-0 flex-col overflow-hidden rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200">
            <FirstTimeTooltip
              isOpen={activeHintId === EDITOR_HINT_IDS.canvas}
              stepLabel={editorHints.hintStep(EDITOR_HINT_IDS.canvas)}
              title="Step preview"
              description="See the captured screenshot and click marker for the selected step. This is what learners will view in the player."
              onDismiss={() => dismissHint(EDITOR_HINT_IDS.canvas)}
              onSkipAll={skipAllHints}
            >
              <p className="mb-3 shrink-0 text-sm font-semibold uppercase tracking-wide text-slate-500">
                Preview
              </p>
            </FirstTimeTooltip>
            <div className="min-h-0 flex-1 overflow-hidden">
              {selectedBranch ? (
                <div className="flex h-full flex-col items-center justify-center overflow-auto p-6">
                  <FlowBranchCard branch={selectedBranch} />
                </div>
              ) : selectedSection ? (
                <div className="flex h-full flex-col items-center justify-center overflow-auto p-6">
                  <FlowSectionCard section={selectedSection} variant="editor" />
                  <p className="mt-6 max-w-md text-center text-sm text-slate-500">
                    Edit title and description in the panel on the right. This
                    card appears in document and player views.
                  </p>
                </div>
              ) : (
                <Canvas step={selectedStep} />
              )}
            </div>
          </main>
          <aside className="flex min-h-0 flex-col overflow-hidden rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200">
            <div className="min-h-0 flex-1 overflow-y-auto">
              {selectedBranch ? (
                <BranchPanel
                  branch={selectedBranch}
                  onAddPath={() => openLinkModal("add-path")}
                />
              ) : selectedSection ? (
                <SectionPanel section={selectedSection} />
              ) : (
                <StepPanel step={selectedStep} />
              )}
            </div>
          </aside>
        </div>

        <LinkPeacockDocModal
          isOpen={isLinkModalOpen}
          hostDocumentId={documentId ?? documentIdFromStore ?? undefined}
          onClose={() => setIsLinkModalOpen(false)}
          onConfirm={(input) => {
            void handleLinkConfirm(input);
          }}
        />

        <ConfirmDialog
          isOpen={isDiscardDialogOpen}
          title="Discard this capture?"
          description="This recording will be removed from this device. It has not been saved to your library or synced to the cloud."
          confirmLabel="Discard capture"
          cancelLabel="Keep reviewing"
          isDestructive
          onConfirm={handleDiscardPendingCapture}
          onCancel={() => setIsDiscardDialogOpen(false)}
        />
      </div>
    </AppErrorBoundary>
    </StepScreenshotEditorProvider>
  );

  if (documentId) {
    return (
      <GuestDocumentGate documentId={documentId}>
        {editorBody}
      </GuestDocumentGate>
    );
  }

  return editorBody;
};
