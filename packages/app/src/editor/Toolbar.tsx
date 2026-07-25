import { Link, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Link2, PanelRight, Play } from 'lucide-react';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { DASHBOARD_PATH } from '@/constants/routes';
import {
  FLOW_DOC_ACTION_CLASS,
  FLOW_DOC_PRIMARY_ACTION_CLASS,
  FlowDocChromeHeader,
} from '@/components/flow/FlowDocChromeHeader';
import { FlowDocumentStatusSwitch } from '@/components/flow/FlowDocumentStatusSwitch';
import { ActionTooltip } from '@/components/ui/ActionTooltip';
import { persistCurrentFlow, persistDocumentStatus, suggestUniqueTitleVersion } from '@/services/flowLibraryService';
import { useFlowStore, usePlayableSteps } from '@/store/flowStore';
import type { FlowDocumentStatus } from '@/types/savedFlow';
import { getDocumentPath } from '@/utils/shareLink';
import { FlowDetailsDrawer, type FlowDetailsInput } from './FlowDetailsDrawer';
import { FirstTimeTooltip } from '@/components/onboarding/FirstTimeTooltip';
import { EDITOR_HINT_IDS } from '@/constants/firstTimeHints';
import {
  isEditorHintActive,
  type EditorHintControl,
} from '@/editor/editorHintControl';
import { useDocumentShareModal } from '@/hooks/useDocumentShareModal';
import {
  DEFAULT_FLOW_VERSION,
  isTitleVersionConflictError,
} from '@/utils/flowDocumentMeta';
import { notifyPersistError } from '@/utils/notify';

interface PendingVersionBump {
  title: string;
  conflictVersion: string;
  suggestedVersion: string;
  previous: FlowDetailsInput;
}

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
  const status = useFlowStore((state) => state.status);
  const setDocumentStatus = useFlowStore((state) => state.setDocumentStatus);
  const playableSteps = usePlayableSteps();
  const documentId =
    useFlowStore((state) => state.documentId) ?? routeDocumentId;
  const isLoaded = useFlowStore((state) => state.isLoaded);
  const updateFlowDetails = useFlowStore((state) => state.updateFlowDetails);

  const [isFlowDetailsOpen, setIsFlowDetailsOpen] = useState(false);
  const [pendingVersionBump, setPendingVersionBump] =
    useState<PendingVersionBump | null>(null);
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
    const previous: FlowDetailsInput = {
      title: flow?.flow.title ?? 'Untitled Flow',
      description: flow?.flow.description ?? '',
      version: flow?.flow.version || DEFAULT_FLOW_VERSION,
    };
    updateFlowDetails(details.title, details.description, details.version);

    if (!documentId) {
      setIsFlowDetailsOpen(false);
      markFlowDetailsSettled();
      return;
    }

    try {
      await persistCurrentFlow(documentId);
      setIsFlowDetailsOpen(false);
      markFlowDetailsSettled();
    } catch (error) {
      if (isTitleVersionConflictError(error)) {
        try {
          const suggested = await suggestUniqueTitleVersion(
            details.title,
            details.version,
            documentId,
          );
          setPendingVersionBump({
            title: error.title,
            conflictVersion: error.version,
            suggestedVersion: suggested.version,
            previous,
          });
        } catch (suggestError) {
          updateFlowDetails(previous.title, previous.description, previous.version);
          notifyPersistError(suggestError, 'Save flow details');
        }
        return;
      }
      updateFlowDetails(previous.title, previous.description, previous.version);
      notifyPersistError(error, 'Save flow details');
    }
  };

  const handleVersionBumpConfirm = async () => {
    if (!documentId || !pendingVersionBump) return;
    try {
      await persistCurrentFlow(documentId, { bumpOwnVersionOnConflict: true });
      setPendingVersionBump(null);
      setIsFlowDetailsOpen(false);
      markFlowDetailsSettled();
    } catch (error) {
      notifyPersistError(error, 'Save with new version');
    }
  };

  const handleVersionBumpCancel = () => {
    if (pendingVersionBump) {
      const { previous } = pendingVersionBump;
      updateFlowDetails(previous.title, previous.description, previous.version);
    }
    setPendingVersionBump(null);
  };

  const handleStatusChange = async (nextStatus: FlowDocumentStatus) => {
    const previous = useFlowStore.getState().status;
    setDocumentStatus(nextStatus);
    if (!documentId) return;
    try {
      await persistDocumentStatus(documentId, nextStatus);
    } catch (error) {
      setDocumentStatus(previous);
      notifyPersistError(error, 'Update documentation status');
    }
  };

  const flowTitle = flow?.flow.title ?? 'Untitled Flow';
  const flowDescription = flow?.flow.description ?? '';
  const flowVersion = flow?.flow.version || DEFAULT_FLOW_VERSION;
  const captureEnvironment = flow?.metadata.captureEnvironment ?? null;
  const playerPath = documentId ? getDocumentPath(documentId, 'player') : '/';
  const showActions = isLoaded && playableSteps.length > 0;
  const canShare = status === 'live';

  return (
    <>
      <FlowDocChromeHeader
        title={flowTitle}
        version={flowVersion}
        modeBadge={{ label: 'Editor', tone: 'peacock' }}
        homeTo={DASHBOARD_PATH}
        actions={
          showActions ? (
            <>
              <FlowDocumentStatusSwitch
                value={status}
                onChange={(next) => {
                  void handleStatusChange(next);
                }}
                size="sm"
              />

              {documentId ? (
                <ActionTooltip
                  label={
                    canShare
                      ? 'Share'
                      : 'Set status to Live before sharing publicly'
                  }
                  wide={!canShare}
                >
                  <button
                    type="button"
                    onClick={openShare}
                    disabled={!canShare}
                    className={`${FLOW_DOC_ACTION_CLASS} disabled:cursor-not-allowed disabled:opacity-50`}
                    aria-label={canShare ? 'Share' : 'Share unavailable while draft'}
                  >
                    <Link2 className="h-4 w-4 shrink-0" aria-hidden />
                    <span className="hidden sm:inline">Share</span>
                  </button>
                </ActionTooltip>
              ) : null}

              <FirstTimeTooltip
                isOpen={isEditorHintActive(editorHints, EDITOR_HINT_IDS.flowDetails)}
                stepLabel={editorHints?.hintStep(EDITOR_HINT_IDS.flowDetails) ?? 'Quick tip'}
                title="Flow details"
                description="Set the documentation title, description, and version shown on your dashboard and share cards."
                placement="bottom"
                onDismiss={() => editorHints?.dismissHint(EDITOR_HINT_IDS.flowDetails)}
              >
                <ActionTooltip label="Flow details">
                  <button
                    type="button"
                    onClick={() => setIsFlowDetailsOpen(true)}
                    className={FLOW_DOC_ACTION_CLASS}
                    aria-label="Flow details"
                  >
                    <PanelRight className="h-4 w-4 shrink-0" aria-hidden />
                    <span className="hidden sm:inline">Flow details</span>
                  </button>
                </ActionTooltip>
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
                  <ActionTooltip label="Play">
                    <Link
                      to={playerPath}
                      state={libraryBackState}
                      className={FLOW_DOC_PRIMARY_ACTION_CLASS}
                      aria-label="Play"
                    >
                      <Play className="h-4 w-4 shrink-0" aria-hidden />
                      <span className="hidden sm:inline">Play</span>
                    </Link>
                  </ActionTooltip>
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

      <ConfirmDialog
        isOpen={pendingVersionBump !== null}
        title="Version already in use"
        description={
          pendingVersionBump
            ? `“${pendingVersionBump.title}” version ${pendingVersionBump.conflictVersion} already exists. Save this documentation as version ${pendingVersionBump.suggestedVersion} instead? The other documentation will stay unchanged.`
            : undefined
        }
        confirmLabel={`Save as ${pendingVersionBump?.suggestedVersion ?? 'new version'}`}
        cancelLabel="Cancel"
        onConfirm={() => {
          void handleVersionBumpConfirm();
        }}
        onCancel={handleVersionBumpCancel}
      />
    </>
  );
};
