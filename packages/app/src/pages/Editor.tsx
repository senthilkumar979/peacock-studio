import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { DASHBOARD_PATH } from '@/constants/routes';
import { Canvas } from '@/editor/Canvas';
import { BranchPanel } from '@/editor/BranchPanel';
import { FlowBranchCard } from '@/editor/FlowBranchCard';
import { LinkPeacockDocModal } from '@/editor/LinkPeacockDocModal';
import { GuestDocumentGate } from '@/components/auth/GuestDocumentGate';
import { StepList } from '@/editor/StepList';
import { StepPanel } from '@/editor/StepPanel';
import { Toolbar } from '@/editor/Toolbar';
import { usePayload } from '@/hooks/usePayload';
import { usePersistDocument } from '@/hooks/usePersistDocument';
import { useSavedDocument } from '@/hooks/useSavedDocument';
import { persistCurrentFlow } from '@/services/flowLibraryService';
import {
  useFlowStore,
  useSelectedBranch,
  useSelectedSection,
  useSelectedStep,
} from '@/store/flowStore';
import { SectionPanel } from '@/editor/SectionPanel';
import { FlowSectionCard } from '@/components/FlowSectionCard';
import { PeacockStudioLoader } from '@/components/PeacockStudioLoader';

export const Editor = () => {
  const { documentId } = useParams<{ documentId: string }>();
  const isExtensionHandoff = !documentId;

  const payload = usePayload({ enabled: isExtensionHandoff });
  const saved = useSavedDocument(documentId);

  const { isLoading, isLoaded, error } = isExtensionHandoff ? payload : saved;
  usePersistDocument(Boolean(documentId && isLoaded), documentId);

  const selectedStep = useSelectedStep();
  const selectedSection = useSelectedSection();
  const selectedBranch = useSelectedBranch();
  const documentIdFromStore = useFlowStore((state) => state.documentId);
  const addPathToBranch = useFlowStore((state) => state.addPathToBranch);
  const addBranchWithPath = useFlowStore((state) => state.addBranchWithPath);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [linkMode, setLinkMode] = useState<'new' | 'add-path'>('new');

  const openLinkModal = (mode: 'new' | 'add-path') => {
    setLinkMode(mode);
    setIsLinkModalOpen(true);
  };

  const handleLinkConfirm = async (input: {
    targetDocumentId: string;
    targetTitle: string;
    targetDescription: string;
    fromStepId: string;
    toStepId: string;
    label: string;
  }) => {
    if (linkMode === 'add-path' && selectedBranch) {
      addPathToBranch(selectedBranch.id, input);
    } else {
      addBranchWithPath(input);
    }
    const id = documentId ?? documentIdFromStore;
    if (id) await persistCurrentFlow(id);
  };

  const editorBody = (
    <div className="flex h-screen flex-col overflow-hidden">
      <Toolbar documentId={documentId} />

      {error && (
        <div className="border-b border-amber-200 bg-amber-50 px-6 py-3 text-sm text-amber-800">
          {error}{' '}
          <Link to={DASHBOARD_PATH} className="font-medium underline">
            Go to dashboard
          </Link>
        </div>
      )}

      {isLoading && (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-12">
          <PeacockStudioLoader size={160} />
          <p className="text-sm text-slate-500">
            {isExtensionHandoff ? 'Waiting for flow from extension…' : 'Loading documentation…'}
          </p>
        </div>
      )}

      {!isLoaded && !isLoading && !error && (
        <div className="flex flex-1 items-center justify-center p-8">
          <div className="max-w-md rounded-xl border border-slate-200 bg-white p-6 text-center shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">No flow loaded</h2>
            <p className="mt-2 text-sm text-slate-600">
              Record steps with the Peacock extension, then stop recording to open the editor.
            </p>
            <Link to={DASHBOARD_PATH} className="btn-peacock mt-4">
              Back to dashboard
            </Link>
          </div>
        </div>
      )}

      {isLoaded && (
        <div className="grid min-h-0 flex-1 grid-cols-[280px_1fr_320px] gap-4 p-4">
          <aside className="flex min-h-0 flex-col overflow-hidden rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200">
            <StepList onLinkPeacockDoc={() => openLinkModal('new')} />
          </aside>
          <main className="min-h-0 overflow-hidden rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200">
            {selectedBranch ? (
              <div className="flex h-full flex-col items-center justify-center overflow-auto p-6">
                <FlowBranchCard branch={selectedBranch} />
              </div>
            ) : selectedSection ? (
              <div className="flex h-full flex-col items-center justify-center overflow-auto p-6">
                <FlowSectionCard section={selectedSection} variant="editor" />
                <p className="mt-6 max-w-md text-center text-sm text-slate-500">
                  Edit title and description in the panel on the right. This card appears in
                  document and player views.
                </p>
              </div>
            ) : (
              <Canvas step={selectedStep} />
            )}
          </main>
          <aside className="min-h-0 overflow-hidden rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200">
            {selectedBranch ? (
              <BranchPanel branch={selectedBranch} onAddPath={() => openLinkModal('add-path')} />
            ) : selectedSection ? (
              <SectionPanel section={selectedSection} />
            ) : (
              <StepPanel step={selectedStep} />
            )}
          </aside>
        </div>
      )}

      <LinkPeacockDocModal
        isOpen={isLinkModalOpen}
        hostDocumentId={documentId ?? documentIdFromStore ?? undefined}
        onClose={() => setIsLinkModalOpen(false)}
        onConfirm={(input) => {
          void handleLinkConfirm(input);
        }}
      />
    </div>
  );

  if (documentId) {
    return <GuestDocumentGate documentId={documentId}>{editorBody}</GuestDocumentGate>;
  }

  return editorBody;
};
