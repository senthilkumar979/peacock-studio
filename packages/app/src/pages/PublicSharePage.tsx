import { Link, useLocation, useParams, useSearchParams } from 'react-router-dom';
import { LANDING_PATH } from '@/constants/routes';
import { EditableShareRedirect } from '@/components/share/EditableShareRedirect';
import { EmptyFlowState } from '@/components/EmptyFlowState';
import { PeacockStudioLoader } from '@/components/PeacockStudioLoader';
import { useFlowDocDefaultView } from '@/hooks/useFlowDocDefaultView';
import { usePublicShare } from '@/hooks/usePublicShare';
import { usePublicSharedDocument } from '@/hooks/usePublicSharedDocument';
import { ProductTourLearner } from '@/pages/ProductTourLearner';
import { FlowDocExperienceViews } from '@/player/FlowDocExperienceViews';
import { resolveFlowDocView } from '@/utils/resolveFlowDocView';
import type { SharedDocumentViewMode } from '@/utils/shareLink';
import type { ResolvedShareLink } from '@/types/shareLink';

interface PublicSharePageProps {
  mode: 'view' | 'edit';
}

export const PublicSharePage = ({ mode }: PublicSharePageProps) => {
  const { token } = useParams<{ token: string }>();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const defaultView = useFlowDocDefaultView();
  const { link, isLoading, error } = usePublicShare(token);
  const { shareLinkViewMode, isReady: isDocumentReady } = usePublicSharedDocument(link);
  const resolvedView = resolveFlowDocView(
    searchParams,
    location.hash,
    defaultView,
    shareLinkViewMode,
  );

  const handleModeChange = (nextMode: SharedDocumentViewMode) => {
    const next = new URLSearchParams(searchParams);
    next.set('view', nextMode);
    setSearchParams(next, { replace: true });
  };

  const handleHubNavigation = () => {
    const next = new URLSearchParams(searchParams);
    next.set('view', 'hub');
    setSearchParams(next, { replace: true });
  };

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

  return (
    <FlowDocExperienceViews
      documentId={link.resourceId}
      resolvedView={resolvedView}
      onModeChange={handleModeChange}
      onOverview={handleHubNavigation}
      showOwnerActions={false}
    />
  );
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
