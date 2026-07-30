import { forwardRef, useCallback, useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import type { FlowMapOverlay } from '@peacock/shared';
import { ArtifactMarkdownViewer } from '@/components/workflow-artifacts/ArtifactMarkdownViewer';
import { CopyToClipboardButton } from '@/components/workflow-artifacts/CopyToClipboardButton';
import { useSaveFlowMapOverlay } from '@/hooks/useWorkflowArtifacts';
import { WORKFLOW_ARTIFACT_TYPES, type WorkflowArtifactType } from '@/types/workflowArtifact';
import { getArtifactCopyContent } from '@/utils/getArtifactCopyContent';
import { FlowMapCanvas } from '@/workflow-artifacts/FlowMapCanvas';
import type { FlowMapCanvasHandle } from '@/workflow-artifacts/flowMapCanvasHandle';

interface ArtifactContentViewProps {
  artifactType: WorkflowArtifactType;
  documentId: string;
  flowTitle: string;
  content: string;
  flowMapOverlay?: FlowMapOverlay | null;
  onFlowMapOverlaySaved?: () => void;
}

export const ArtifactContentView = forwardRef<FlowMapCanvasHandle, ArtifactContentViewProps>(
  (
    {
      artifactType,
      documentId,
      flowTitle,
      content,
      flowMapOverlay,
      onFlowMapOverlaySaved,
    },
    ref,
  ) => {
  const [isSourceOpen, setIsSourceOpen] = useState(false);
  const { saveOverlay, isSaving } = useSaveFlowMapOverlay(documentId);
  const copyContent = getArtifactCopyContent(artifactType, content);

  const handleOverlaySave = useCallback(
    async (overlay: FlowMapOverlay) => {
      await saveOverlay(overlay);
      onFlowMapOverlaySaved?.();
    },
    [onFlowMapOverlaySaved, saveOverlay],
  );

  if (artifactType === WORKFLOW_ARTIFACT_TYPES.flowMap) {
    return (
      <div className="space-y-4">
        <FlowMapCanvas
          ref={ref}
          documentId={documentId}
          flowTitle={flowTitle}
          overlay={flowMapOverlay}
          onOverlaySave={handleOverlaySave}
          isSavingOverlay={isSaving}
        />
        <div className="rounded-2xl border border-slate-200 bg-white">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
            <button
              type="button"
              onClick={() => setIsSourceOpen((open) => !open)}
              className="inline-flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-peacock-700"
            >
              {isSourceOpen ? (
                <ChevronUp className="h-4 w-4" aria-hidden />
              ) : (
                <ChevronDown className="h-4 w-4" aria-hidden />
              )}
              {isSourceOpen ? 'Hide Mermaid source' : 'View Mermaid source'}
            </button>
            <CopyToClipboardButton content={copyContent} label="Copy Mermaid" />
          </div>
          {isSourceOpen ? (
            <div className="p-4">
              <ArtifactMarkdownViewer content={copyContent} />
            </div>
          ) : null}
        </div>
      </div>
    );
  }

  return <ArtifactMarkdownViewer content={content} />;
});

ArtifactContentView.displayName = 'ArtifactContentView';
