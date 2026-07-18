import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { AppHeader } from "@/components/AppHeader";
import { persistCurrentFlow } from "@/services/flowLibraryService";
import { useFlowStore, usePlayableSteps } from "@/store/flowStore";
import { getDocumentPath } from "@/utils/shareLink";
import { FlowDetailsDrawer, type FlowDetailsInput } from "./FlowDetailsDrawer";
import { FirstTimeTooltip } from "@/components/onboarding/FirstTimeTooltip";
import { EDITOR_HINT_IDS } from "@/constants/firstTimeHints";
import {
  isEditorHintActive,
  type EditorHintControl,
} from "@/editor/editorHintControl";

function getFlowDetailsPromptKey(createdAt: number): string {
  return `peacock-flow-details-prompted-${createdAt}`;
}

interface ToolbarProps {
  documentId?: string;
  onEditorHintsReady?: (ready: boolean) => void;
  editorHints?: EditorHintControl;
}

export const Toolbar = ({
  documentId: routeDocumentId,
  onEditorHintsReady,
  editorHints,
}: ToolbarProps) => {
  const flow = useFlowStore((state) => state.flow);
  const playableSteps = usePlayableSteps();
  const documentId =
    useFlowStore((state) => state.documentId) ?? routeDocumentId;
  const isLoaded = useFlowStore((state) => state.isLoaded);
  const updateFlowDetails = useFlowStore((state) => state.updateFlowDetails);

  const [isFlowDetailsOpen, setIsFlowDetailsOpen] = useState(false);

  useEffect(() => {
    if (!isLoaded || !flow) {
      onEditorHintsReady?.(false);
      return;
    }

    const key = getFlowDetailsPromptKey(flow.metadata.createdAt);
    if (sessionStorage.getItem(key)) {
      onEditorHintsReady?.(true);
      return;
    }

    setIsFlowDetailsOpen(true);
    onEditorHintsReady?.(false);
  }, [isLoaded, flow, onEditorHintsReady]);

  const markFlowDetailsSettled = () => {
    if (flow) {
      sessionStorage.setItem(getFlowDetailsPromptKey(flow.metadata.createdAt), '1');
    }
    onEditorHintsReady?.(true);
  };

  const handleFlowDetailsSave = async (details: FlowDetailsInput) => {
    updateFlowDetails(details.title, details.description, details.version);

    if (documentId) {
      await persistCurrentFlow(documentId);
    }

    setIsFlowDetailsOpen(false);
    markFlowDetailsSettled();
  };

  const flowTitle = flow?.flow.title ?? "Untitled Flow";
  const flowDescription = flow?.flow.description ?? "";
  const flowVersion = flow?.flow.version ?? "";
  const captureEnvironment = flow?.metadata.captureEnvironment ?? null;
  const playerPath = documentId ? getDocumentPath(documentId, "player") : "/";

  return (
    <>
      <AppHeader
        eyebrow="Peacock Studio Editor"
        title={flowTitle}
        description={flowDescription || undefined}
        homeLink
        documentId={documentId}
      >
        <p className="text-sm text-slate-500">
          {playableSteps.length} {playableSteps.length === 1 ? "step" : "steps"}
        </p>
        {isLoaded && playableSteps.length > 0 && (
          <>
            <FirstTimeTooltip
              isOpen={isEditorHintActive(editorHints, EDITOR_HINT_IDS.flowDetails)}
              stepLabel={editorHints?.hintStep(EDITOR_HINT_IDS.flowDetails) ?? "Quick tip"}
              title="Flow details"
              description="Set the documentation title, description, and version shown on your dashboard and share cards."
              placement="bottom"
              onDismiss={() => editorHints?.dismissHint(EDITOR_HINT_IDS.flowDetails)}
            >
              <button
                type="button"
                onClick={() => setIsFlowDetailsOpen(true)}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Flow details
              </button>
            </FirstTimeTooltip>
            {documentId ? (
              <FirstTimeTooltip
                isOpen={isEditorHintActive(editorHints, EDITOR_HINT_IDS.play)}
                stepLabel={editorHints?.hintStep(EDITOR_HINT_IDS.play) ?? "Quick tip"}
                title="Play your documentation"
                description="Open the learner player and walk through your flow exactly as viewers will experience it."
                placement="bottom"
                onDismiss={() => editorHints?.dismissHint(EDITOR_HINT_IDS.play)}
              >
                <Link
                  to={playerPath}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 bg-peacock-500 text-white hover:text-peacock-500"
                >
                  Play
                </Link>
              </FirstTimeTooltip>
            ) : null}
          </>
        )}
      </AppHeader>

      <FlowDetailsDrawer
        isOpen={isFlowDetailsOpen}
        initialTitle={flowTitle}
        initialDescription={flowDescription}
        initialVersion={flowVersion}
        captureEnvironment={captureEnvironment}
        confirmLabel="Save"
        onSave={(details) => {
          void handleFlowDetailsSave(details);
        }}
        onClose={() => {
          setIsFlowDetailsOpen(false);
          markFlowDetailsSettled();
        }}
      />
    </>
  );
};
