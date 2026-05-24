import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { AppHeader } from '@/components/AppHeader';
import { persistCurrentFlow } from '@/services/flowLibraryService';
import { useFlowStore } from '@/store/flowStore';
import { FlowDetailsModal } from './FlowDetailsModal';

function getFlowDetailsPromptKey(createdAt: number): string {
  return `peacock-flow-details-prompted-${createdAt}`;
}

interface ToolbarProps {
  documentId?: string;
}

export const Toolbar = ({ documentId: routeDocumentId }: ToolbarProps) => {
  const flow = useFlowStore((state) => state.flow);
  const steps = useFlowStore((state) => state.steps);
  const documentId = useFlowStore((state) => state.documentId) ?? routeDocumentId;
  const isLoaded = useFlowStore((state) => state.isLoaded);
  const updateFlowDetails = useFlowStore((state) => state.updateFlowDetails);

  const [isFlowDetailsOpen, setIsFlowDetailsOpen] = useState(false);

  useEffect(() => {
    if (!isLoaded || !flow) return;

    const key = getFlowDetailsPromptKey(flow.metadata.createdAt);
    if (sessionStorage.getItem(key)) return;

    setIsFlowDetailsOpen(true);
  }, [isLoaded, flow]);

  const handleFlowDetailsSave = async (title: string, description: string) => {
    updateFlowDetails(title, description);

    if (flow) {
      sessionStorage.setItem(getFlowDetailsPromptKey(flow.metadata.createdAt), '1');
    }

    if (documentId) {
      await persistCurrentFlow(documentId);
    }

    setIsFlowDetailsOpen(false);
  };

  const flowTitle = flow?.flow.title ?? 'Untitled Flow';
  const flowDescription = flow?.flow.description ?? '';
  const playerPath = documentId ? `/docs/${documentId}` : '/';

  return (
    <>
      <AppHeader
        eyebrow="Peacock Studio Editor"
        title={flowTitle}
        description={flowDescription || undefined}
        homeLink
        documentId={documentId}
      >
        <p className="text-sm text-slate-500">{steps.length} steps</p>
        {isLoaded && steps.length > 0 && (
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
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Play
              </Link>
            ) : null}
          </>
        )}
      </AppHeader>

      <FlowDetailsModal
        isOpen={isFlowDetailsOpen}
        initialTitle={flowTitle}
        initialDescription={flowDescription}
        confirmLabel="Save"
        onSave={(title, description) => {
          void handleFlowDetailsSave(title, description);
        }}
        onClose={() => setIsFlowDetailsOpen(false)}
      />
    </>
  );
};
