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

  const [isExporting, setIsExporting] = useState(false);
  const [isFlowDetailsOpen, setIsFlowDetailsOpen] = useState(false);
  const [exportAfterSave, setExportAfterSave] = useState(false);

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

    const shouldExport = exportAfterSave;
    setIsFlowDetailsOpen(false);
    setExportAfterSave(false);

    if (!shouldExport) return;

    const state = useFlowStore.getState();
    if (!state.flow || !state.steps.length) return;

    setIsExporting(true);
    try {
      const { exportFlowPdf } = await import('@/pdf/exportFlowPdf');
      await exportFlowPdf({
        flow: state.flow,
        steps: state.steps,
        screenshotUrls: state.screenshotUrls,
      });
    } finally {
      setIsExporting(false);
    }
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
      >
        <p className="text-sm text-slate-500">{steps.length} steps</p>
        {isLoaded && steps.length > 0 && (
          <>
            <button
              type="button"
              onClick={() => {
                setExportAfterSave(false);
                setIsFlowDetailsOpen(true);
              }}
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
            <button
              type="button"
              onClick={() => {
                setExportAfterSave(true);
                setIsFlowDetailsOpen(true);
              }}
              disabled={isExporting}
              className="btn-peacock btn-peacock--sm"
            >
              {isExporting ? 'Exporting…' : 'Export PDF'}
            </button>
          </>
        )}
      </AppHeader>

      <FlowDetailsModal
        isOpen={isFlowDetailsOpen}
        initialTitle={flowTitle}
        initialDescription={flowDescription}
        confirmLabel={exportAfterSave ? 'Save & export PDF' : 'Save'}
        onSave={(title, description) => {
          void handleFlowDetailsSave(title, description);
        }}
        onClose={() => {
          setIsFlowDetailsOpen(false);
          setExportAfterSave(false);
        }}
      />
    </>
  );
};
