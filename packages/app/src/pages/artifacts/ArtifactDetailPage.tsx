import { useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { AppFooter } from '@/components/AppFooter';
import { PeacockStudioLoader } from '@/components/PeacockStudioLoader';
import { AppHeader } from '@/components/AppHeader';
import { CloudAuthActions } from '@/components/auth/CloudAuthActions';
import { GenericErrorPage } from '@/components/errors/GenericErrorPage';
import { ArtifactContentView } from '@/components/workflow-artifacts/ArtifactContentView';
import { ArtifactDetailToolbar } from '@/components/workflow-artifacts/ArtifactDetailToolbar';
import { getArtifactUiConfig } from '@/constants/workflowArtifactUi';
import { useWorkflowArtifactDetail } from '@/hooks/useWorkflowArtifacts';
import { useSessionMode } from '@/hooks/useSessionMode';
import { generateWorkflowArtifact } from '@/services/workflowArtifactService';
import type { WorkflowArtifactType } from '@/types/workflowArtifact';
import { WORKFLOW_ARTIFACT_TYPES } from '@/types/workflowArtifact';
import { trackEvent } from '@/analytics/analyticsClient';
import { AnalyticsEvents } from '@/analytics/events';
import { notifyError, notifyPromise, notifySuccess } from '@/utils/notify';
import { downloadTextFile } from '@/utils/downloadTextFile';
import { getDocumentPath } from '@/utils/shareLink';
import { buildFlowMapPngFilename } from '@/workflow-artifacts/exportFlowMapCanvasPng';
import type { FlowMapCanvasHandle } from '@/workflow-artifacts/flowMapCanvasHandle';

interface ArtifactDetailPageProps {
  artifactType: WorkflowArtifactType;
}

export const ArtifactDetailPage = ({ artifactType }: ArtifactDetailPageProps) => {
  const { documentId } = useParams<{ documentId: string }>();
  const config = getArtifactUiConfig(artifactType);
  const sessionMode = useSessionMode();
  const { artifact, isLoading, error, refresh } = useWorkflowArtifactDetail(
    documentId,
    artifactType,
  );
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [hasActionError, setHasActionError] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const flowMapCanvasRef = useRef<FlowMapCanvasHandle>(null);

  const handleDownload = async () => {
    if (!artifact) return;

    if (artifactType === WORKFLOW_ARTIFACT_TYPES.flowMap) {
      const canvas = flowMapCanvasRef.current;
      if (!canvas) {
        notifyError(
          'Canvas not ready',
          'Wait for the flow map to finish rendering, then try downloading again.',
        );
        return;
      }
      setIsDownloading(true);
      try {
        await notifyPromise(canvas.downloadPng(buildFlowMapPngFilename(artifact.flowTitle)), {
          loading: 'Preparing PNG…',
          success: 'PNG downloaded',
          context: 'Download flow map PNG',
          event: AnalyticsEvents.artifactDownloaded,
          eventProps: { artifact_type: artifactType, format: 'png' },
        });
      } catch {
        setHasActionError(true);
      } finally {
        setIsDownloading(false);
      }
      return;
    }

    downloadTextFile(
      artifact.content,
      `${artifact.flowTitle.replace(/\s+/g, '-').toLowerCase()}.${config.fileExtension}`,
    );
    notifySuccess('File downloaded');
    trackEvent(AnalyticsEvents.artifactDownloaded, {
      artifact_type: artifactType,
      format: config.fileExtension,
    });
  };

  const handleRegenerate = async () => {
    if (!documentId) return;
    setHasActionError(false);
    setIsRegenerating(true);
    try {
      await notifyPromise(
        generateWorkflowArtifact(documentId, artifactType).then(() => refresh()),
        {
          loading: 'Regenerating…',
          success: 'Artifact regenerated',
          context: 'Regenerate workflow artifact',
          event: AnalyticsEvents.artifactRegenerated,
          eventProps: { artifact_type: artifactType, document_id: documentId },
        },
      );
    } catch {
      setHasActionError(true);
    } finally {
      setIsRegenerating(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <AppHeader
        eyebrow="Workflow outputs"
        title={artifact?.flowTitle ?? config.title}
        description={config.description}
        homeLink
        documentId={documentId}
      >
        {documentId ? (
          <Link
            to={getDocumentPath(documentId)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Open flow
          </Link>
        ) : null}
      </AppHeader>

      <main
        className={`mx-auto w-full flex-1 px-4 py-8 sm:px-6 ${
          artifactType === WORKFLOW_ARTIFACT_TYPES.flowMap ? 'max-w-7xl' : 'max-w-5xl'
        }`}
      >
        <Link
          to={config.libraryPath}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-peacock-700"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          All {config.pluralTitle.toLowerCase()}
        </Link>

        {sessionMode !== 'cloud' ? (
          <div className="mt-6">
            <CloudAuthActions
              variant="callout"
              message={`Sign in to view or generate ${config.title.toLowerCase()} for this flow.`}
            />
          </div>
        ) : null}

        {isLoading ? (
          <div className="mt-10 flex justify-center">
            <PeacockStudioLoader size={120} />
          </div>
        ) : null}

        {error || hasActionError ? (
          <div className="mt-6">
            <GenericErrorPage
              compact
              onRetry={() => {
                setHasActionError(false);
                void refresh();
              }}
            />
          </div>
        ) : null}

        {!isLoading && !artifact && !error && !hasActionError ? (
          <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
            <p className="text-sm text-slate-600">
              No {config.title.toLowerCase()} generated for this flow yet.
            </p>
            {documentId ? (
              <button
                type="button"
                disabled={isRegenerating}
                onClick={() => void handleRegenerate()}
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-peacock-600 px-4 py-2 text-sm font-medium text-white hover:bg-peacock-700 disabled:opacity-60"
              >
                {isRegenerating ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
                {config.generateLabel}
              </button>
            ) : null}
          </div>
        ) : null}

        {artifact && documentId ? (
          <div className="mt-8 space-y-4">
            <ArtifactDetailToolbar
              artifact={artifact}
              config={config}
              isRegenerating={isRegenerating}
              isDownloading={isDownloading}
              onRegenerate={() => void handleRegenerate()}
              onDownload={() => void handleDownload()}
            />
            <ArtifactContentView
              ref={artifactType === WORKFLOW_ARTIFACT_TYPES.flowMap ? flowMapCanvasRef : undefined}
              artifactType={artifactType}
              documentId={documentId}
              flowTitle={artifact.flowTitle}
              content={artifact.content}
              flowMapOverlay={artifact.metadata}
              onFlowMapOverlaySaved={() => void refresh()}
            />
          </div>
        ) : null}
      </main>

      <AppFooter />
    </div>
  );
};
