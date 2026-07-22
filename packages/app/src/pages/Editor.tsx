import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { DASHBOARD_PATH } from '@/constants/routes';
import { FirstTimeTooltip } from '@/components/onboarding/FirstTimeTooltip';
import {
  EDITOR_HINT_IDS,
  getEditorHintSequence,
  getHintStepLabel,
} from '@/constants/firstTimeHints';
import { useFirstTimeHintTour } from '@/hooks/useFirstTimeHint';
import type { EditorHintControl } from '@/editor/editorHintControl';
import { Canvas } from '@/editor/Canvas';
import { BranchPanel } from '@/editor/BranchPanel';
import { FlowBranchCard } from '@/editor/FlowBranchCard';
import { LinkPeacockDocModal } from '@/editor/LinkPeacockDocModal';
import { GuestDocumentGate } from '@/components/auth/GuestDocumentGate';
import { ResourceNotFoundPage } from '@/components/errors/ResourceNotFoundPage';
import { StepList } from '@/editor/StepList';
import { StepPanel } from '@/editor/StepPanel';
import { Toolbar } from '@/editor/Toolbar';
import { usePayload } from '@/hooks/usePayload';
import { usePersistDocument } from '@/hooks/usePersistDocument';
import { useSavedDocument } from '@/hooks/useSavedDocument';
import { persistCurrentFlow } from '@/services/flowLibraryService';
import {
  useFlowStore,
  usePlayableSteps,
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
  const playableSteps = usePlayableSteps();
  const resolvedDocumentId = documentId ?? documentIdFromStore;
  const addPathToBranch = useFlowStore((state) => state.addPathToBranch);
  const addBranchWithPath = useFlowStore((state) => state.addBranchWithPath);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [linkMode, setLinkMode] = useState<'new' | 'add-path'>('new');
  const [editorHintsReady, setEditorHintsReady] = useState(false);

  const editorHintSequence = useMemo(
    () =>
      getEditorHintSequence({
        canBranch: isLoaded,
        canPlay: Boolean(resolvedDocumentId),
        canUseToolbarActions: playableSteps.length > 0,
      }),
    [isLoaded, playableSteps.length, resolvedDocumentId],
  );

  const { activeHintId, dismissHint } = useFirstTimeHintTour(editorHintSequence, {
    ready: isLoaded && editorHintsReady,
  });

  const editorHints: EditorHintControl = useMemo(
    () => ({
      activeHintId,
      hintStep: (hintId) => getHintStepLabel(hintId, editorHintSequence),
      dismissHint,
    }),
    [activeHintId, dismissHint, editorHintSequence],
  );

  const openLinkModal = (mode: 'new' | 'add-path') => {
    setLinkMode(mode);
    setIsLinkModalOpen(true);
  };

  if (error) {
    return (
      <ResourceNotFoundPage
        title={isExtensionHandoff ? 'Could not load capture' : 'Documentation not found'}
        description={error}
      />
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
      <Toolbar
        documentId={documentId}
        onEditorHintsReady={setEditorHintsReady}
        editorHints={editorHints}
      />

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
            <StepList
              onLinkPeacockDoc={() => openLinkModal('new')}
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
                  Edit title and description in the panel on the right. This card appears in
                  document and player views.
                </p>
              </div>
            ) : (
              <Canvas step={selectedStep} />
            )}
            </div>
          </main>
          <aside className="flex min-h-0 flex-col overflow-hidden rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200">
            <FirstTimeTooltip
              isOpen={activeHintId === EDITOR_HINT_IDS.stepPanel}
              stepLabel={editorHints.hintStep(EDITOR_HINT_IDS.stepPanel)}
              title="Step details"
              description="Edit the title, notes, and screenshot for the selected step. Changes save automatically to your library."
              placement="top"
              onDismiss={() => dismissHint(EDITOR_HINT_IDS.stepPanel)}
            >
              <p className="mb-3 shrink-0 text-sm font-semibold uppercase tracking-wide text-slate-500">
                Details
              </p>
            </FirstTimeTooltip>
            <div className="min-h-0 flex-1 overflow-hidden">
            {selectedBranch ? (
              <BranchPanel branch={selectedBranch} onAddPath={() => openLinkModal('add-path')} />
            ) : selectedSection ? (
              <SectionPanel section={selectedSection} />
            ) : (
              <StepPanel step={selectedStep} />
            )}
            </div>
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
