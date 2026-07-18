import { FileText } from 'lucide-react';
import { PeacockStudioLoader } from '@/components/PeacockStudioLoader';
import { CloudAuthActions } from '@/components/auth/CloudAuthActions';
import { GenericErrorPage } from '@/components/errors/GenericErrorPage';
import { LibraryLayout } from '@/layouts/LibraryLayout';
import { Link } from 'react-router-dom';
import { getArtifactUiConfig } from '@/constants/workflowArtifactUi';
import { useWorkflowArtifactLibrary } from '@/hooks/useWorkflowArtifacts';
import { useSessionMode } from '@/hooks/useSessionMode';
import type { WorkflowArtifactType } from '@/types/workflowArtifact';
import { formatFlowDate } from '@/utils/formatFlowDate';

interface ArtifactLibraryPageProps {
  artifactType: WorkflowArtifactType;
}

export const ArtifactLibraryPage = ({ artifactType }: ArtifactLibraryPageProps) => {
  const config = getArtifactUiConfig(artifactType);
  const sessionMode = useSessionMode();
  const { artifacts, isLoading, error, refresh } = useWorkflowArtifactLibrary(artifactType);
  const Icon = config.icon;

  return (
    <LibraryLayout>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <span className="inline-flex rounded-2xl bg-peacock-50 p-3 text-peacock-700 ring-1 ring-peacock-100">
              <Icon className="h-6 w-6" aria-hidden />
            </span>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                {config.pluralTitle}
              </h1>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{config.description}</p>
            </div>
          </div>
        </div>

        {sessionMode !== 'cloud' ? (
          <div className="mt-6">
            <CloudAuthActions
              variant="callout"
              title={config.pluralTitle}
              message={`Sign in to generate and browse ${config.pluralTitle.toLowerCase()}.`}
            />
          </div>
        ) : null}

        {isLoading ? (
          <div className="mt-10 flex justify-center">
            <PeacockStudioLoader size={120} />
          </div>
        ) : null}

        {error ? (
          <div className="mt-6">
            <GenericErrorPage compact onRetry={() => void refresh()} />
          </div>
        ) : null}

        {!isLoading && !error && sessionMode === 'cloud' ? (
          artifacts.length === 0 ? (
            <p className="mt-8 text-sm text-slate-500">
              Nothing generated yet. Open a flow document and use the workflow outputs panel to
              generate {config.title.toLowerCase()}.
            </p>
          ) : (
            <ul className="mt-8 space-y-3">
              {artifacts.map((artifact) => (
                <li key={artifact.id}>
                  <Link
                    to={config.getDetailPath(artifact.documentId)}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm transition hover:border-peacock-200 hover:bg-peacock-50/30"
                  >
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900">{artifact.flowTitle}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        Updated {formatFlowDate(new Date(artifact.updatedAt).getTime())}
                      </p>
                    </div>
                    <span className="inline-flex items-center gap-1.5 text-sm font-medium text-peacock-700">
                      <FileText className="h-4 w-4" aria-hidden />
                      View
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )
        ) : null}
      </main>
    </LibraryLayout>
  );
};
