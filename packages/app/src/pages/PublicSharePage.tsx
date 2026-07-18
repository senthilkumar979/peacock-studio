import { Link, useParams } from 'react-router-dom';
import { LANDING_PATH } from '@/constants/routes';
import { EditableShareRedirect } from '@/components/share/EditableShareRedirect';
import { EmptyFlowState } from '@/components/EmptyFlowState';
import { PeacockStudioLoader } from '@/components/PeacockStudioLoader';
import { usePublicShare } from '@/hooks/usePublicShare';
import { usePublicSharedDocument } from '@/hooks/usePublicSharedDocument';
import { ProductTourLearner } from '@/pages/ProductTourLearner';
import { DocumentView } from '@/player/DocumentView';
import { PlayerView } from '@/player/PlayerView';
import type { ResolvedShareLink } from '@/types/shareLink';

interface PublicSharePageProps {
  mode: 'view' | 'edit';
}

export const PublicSharePage = ({ mode }: PublicSharePageProps) => {
  const { token } = useParams<{ token: string }>();
  const { link, isLoading, error } = usePublicShare(token);
  const { viewMode, isReady: isDocumentReady } = usePublicSharedDocument(link);

  if (mode === 'edit') {
    if (!token) {
      return (
        <EmptyFlowState
          title="Invalid link"
          description="This edit link is missing a share token."
        />
      );
    }

    return <EditableShareRedirect token={token} />;
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50">
        <PeacockStudioLoader size={160} />
        <p className="text-sm text-slate-500">Loading shared content…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="border-b border-amber-200 bg-amber-50 px-6 py-3 text-sm text-amber-800">
          {error}{' '}
          <Link to={LANDING_PATH} className="font-medium underline">
            Go to Peacock Studio
          </Link>
        </div>
      </div>
    );
  }

  if (!link) {
    return (
      <EmptyFlowState
        title="Share link not found"
        description="This link may have expired or been revoked."
      />
    );
  }

  if (link.resourceType === 'tour') {
    return <PublicTourShareView link={link} />;
  }

  if (!isDocumentReady) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50">
        <PeacockStudioLoader size={160} />
        <p className="text-sm text-slate-500">Loading documentation…</p>
      </div>
    );
  }

  if (viewMode === 'player') {
    return <PlayerView documentId={link.resourceId} onModeChange={() => undefined} />;
  }

  return <DocumentView documentId={link.resourceId} onModeChange={() => undefined} />;
};

interface PublicTourShareViewProps {
  link: ResolvedShareLink;
}

const PublicTourShareView = ({ link }: PublicTourShareViewProps) => (
  <ProductTourLearner
    tourId={link.resourceId}
    isPresenter={link.settings.presenter ?? false}
    isPublicShare
  />
);
