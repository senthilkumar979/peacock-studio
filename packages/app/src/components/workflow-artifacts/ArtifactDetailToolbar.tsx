import { Download, Loader2, RefreshCw } from 'lucide-react';
import { CopyToClipboardButton } from '@/components/workflow-artifacts/CopyToClipboardButton';
import type { WorkflowArtifactUiConfig } from '@/constants/workflowArtifactUi';
import {
  WORKFLOW_ARTIFACT_TYPES,
  type WorkflowArtifact,
} from '@/types/workflowArtifact';
import { formatFlowDate } from '@/utils/formatFlowDate';
import { getArtifactCopyContent } from '@/utils/getArtifactCopyContent';

interface ArtifactDetailToolbarProps {
  artifact: WorkflowArtifact;
  config: WorkflowArtifactUiConfig;
  isRegenerating: boolean;
  onRegenerate: () => void;
  onDownload: () => void;
}

export const ArtifactDetailToolbar = ({
  artifact,
  config,
  isRegenerating,
  onRegenerate,
  onDownload,
}: ArtifactDetailToolbarProps) => {
  const copyContent = getArtifactCopyContent(config.artifactType, artifact.content);
  const copyLabel =
    config.artifactType === WORKFLOW_ARTIFACT_TYPES.flowMap
      ? 'Copy Mermaid'
      : config.artifactType === WORKFLOW_ARTIFACT_TYPES.playwright
        ? 'Copy Playwright spec'
        : 'Copy test cases';

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <p className="text-sm text-slate-500">
        Generated {formatFlowDate(new Date(artifact.generatedAt).getTime())}
      </p>
      <div className="flex flex-wrap gap-2">
        <CopyToClipboardButton content={copyContent} label={copyLabel} />
        <button
          type="button"
          disabled={isRegenerating}
          onClick={onRegenerate}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
        >
          {isRegenerating ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          ) : (
            <RefreshCw className="h-4 w-4" aria-hidden />
          )}
          Regenerate
        </button>
        <button
          type="button"
          onClick={onDownload}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          <Download className="h-4 w-4" aria-hidden />
          Download
        </button>
      </div>
    </div>
  );
};
