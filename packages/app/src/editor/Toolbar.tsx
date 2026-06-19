import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { AppHeader } from "@/components/AppHeader";
import { persistCurrentFlow } from "@/services/flowLibraryService";
import { useFlowStore, usePlayableSteps } from "@/store/flowStore";
import { getDocumentPath } from "@/utils/shareLink";
import { FlowDetailsDrawer, type FlowDetailsInput } from "./FlowDetailsDrawer";

function getFlowDetailsPromptKey(createdAt: number): string {
  return `peacock-flow-details-prompted-${createdAt}`;
}

interface ToolbarProps {
  documentId?: string;
}

export const Toolbar = ({ documentId: routeDocumentId }: ToolbarProps) => {
  const flow = useFlowStore((state) => state.flow);
  const playableSteps = usePlayableSteps();
  const documentId =
    useFlowStore((state) => state.documentId) ?? routeDocumentId;
  const isLoaded = useFlowStore((state) => state.isLoaded);
  const updateFlowDetails = useFlowStore((state) => state.updateFlowDetails);

  const [isFlowDetailsOpen, setIsFlowDetailsOpen] = useState(false);

  useEffect(() => {
    if (!isLoaded || !flow) return;

    const key = getFlowDetailsPromptKey(flow.metadata.createdAt);
    if (sessionStorage.getItem(key)) return;

    setIsFlowDetailsOpen(true);
  }, [isLoaded, flow]);

  const handleFlowDetailsSave = async (details: FlowDetailsInput) => {
    updateFlowDetails(details.title, details.description, details.version);

    if (flow) {
      sessionStorage.setItem(
        getFlowDetailsPromptKey(flow.metadata.createdAt),
        "1",
      );
    }

    if (documentId) {
      await persistCurrentFlow(documentId);
    }

    setIsFlowDetailsOpen(false);
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
            <button
              type="button"
              onClick={() => setIsFlowDetailsOpen(true)}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Flow details
            </button>
            {documentId ? (
              <Link
                to={playerPath}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 bg-peacock-500 text-white hover:text-peacock-500"
              >
                Play
              </Link>
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
        onClose={() => setIsFlowDetailsOpen(false)}
      />
    </>
  );
};
