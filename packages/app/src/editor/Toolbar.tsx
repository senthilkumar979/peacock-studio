import { Link, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Link2, PanelRight, Play } from 'lucide-react';
import { DASHBOARD_PATH } from '@/constants/routes';
import {
  FLOW_DOC_ACTION_CLASS,
  FLOW_DOC_PRIMARY_ACTION_CLASS,
  FlowDocChromeHeader,
} from '@/components/flow/FlowDocChromeHeader';
import { persistCurrentFlow } from '@/services/flowLibraryService';
import { useFlowStore, usePlayableSteps } from '@/store/flowStore';
import { getDocumentPath } from '@/utils/shareLink';
import { FlowDetailsDrawer, type FlowDetailsInput } from './FlowDetailsDrawer';
import { FirstTimeTooltip } from '@/components/onboarding/FirstTimeTooltip';
import { EDITOR_HINT_IDS } from '@/constants/firstTimeHints';
import {
  isEditorHintActive,
  type EditorHintControl,
} from '@/editor/editorHintControl';
import { useDocumentShareModal } from '@/hooks/useDocumentShareModal';

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
  const location = useLocation();
  const libraryBackState = location.state;
  const flow = useFlowStore((state) => state.flow);
  const playableSteps = usePlayableSteps();
  const documentId =
    useFlowStore((state) => state.documentId) ?? routeDocumentId;
  const isLoaded = useFlowStore((state) => state.isLoaded);
  const updateFlowDetails = useFlowStore((state) => state.updateFlowDetails);

  const [isFlowDetailsOpen, setIsFlowDetailsOpen] = useState(false);
  const { openShare, shareModal } = useDocumentShareModal(documentId ?? '');

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

  const flowTitle = flow?.flow.title ?? 'Untitled Flow';
  const flowDescription = flow?.flow.description ?? '';
  const flowVersion = flow?.flow.version ?? '';
  const captureEnvironment = flow?.metadata.captureEnvironment ?? null;
  const playerPath = documentId ? getDocumentPath(documentId, 'player') : '/';
  const showActions = isLoaded && playableSteps.length > 0;

  return (
    <>
      <FlowDocChromeHeader
        title={flowTitle}
        modeBadge={{ label: 'Editor', tone: 'peacock' }}
        homeTo={DASHBOARD_PATH}
        actions={
          showActions ? (
            <>
              {documentId ? (
                <button type="button" onClick={openShare} className={FLOW_DOC_ACTION_CLASS}>
                  <Link2 className="h-4 w-4 shrink-0" aria-hidden />
                  <span className="hidden sm:inline">Share</span>
                </button>
              ) : null}

              <FirstTimeTooltip
                isOpen={isEditorHintActive(editorHints, EDITOR_HINT_IDS.flowDetails)}
                stepLabel={editorHints?.hintStep(EDITOR_HINT_IDS.flowDetails) ?? 'Quick tip'}
                title="Flow details"
                description="Set the documentation title, description, and version shown on your dashboard and share cards."
                placement="bottom"
                onDismiss={() => editorHints?.dismissHint(EDITOR_HINT_IDS.flowDetails)}
              >
                <button
                  type="button"
                  onClick={() => setIsFlowDetailsOpen(true)}
                  className={FLOW_DOC_ACTION_CLASS}
                >
                  <PanelRight className="h-4 w-4 shrink-0" aria-hidden />
                  <span className="hidden sm:inline">Flow details</span>
                </button>
              </FirstTimeTooltip>

              {documentId ? (
                <FirstTimeTooltip
                  isOpen={isEditorHintActive(editorHints, EDITOR_HINT_IDS.play)}
                  stepLabel={editorHints?.hintStep(EDITOR_HINT_IDS.play) ?? 'Quick tip'}
                  title="Play your documentation"
                  description="Open the learner player and walk through your flow exactly as viewers will experience it."
                  placement="bottom"
                  onDismiss={() => editorHints?.dismissHint(EDITOR_HINT_IDS.play)}
                >
                  <Link
                    to={playerPath}
                    state={libraryBackState}
                    className={FLOW_DOC_PRIMARY_ACTION_CLASS}
                  >
                    <Play className="h-4 w-4 shrink-0" aria-hidden />
                    <span className="hidden sm:inline">Play</span>
                  </Link>
                </FirstTimeTooltip>
              ) : null}
            </>
          ) : undefined
        }
      />

      {documentId ? shareModal : null}

      <FlowDetailsDrawer
        isOpen={isFlowDetailsOpen}
        contentKey={documentId ?? flow?.metadata.createdAt?.toString()}
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
