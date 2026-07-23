import type { ReactNode } from 'react';
import { Navigate, useLocation, useParams, useSearchParams } from 'react-router-dom';
import { PeacockEmbedWatermark } from '@/components/embed/PeacockEmbedWatermark';
import { HardErrorPage } from '@/components/errors/HardErrorPage';
import { EditableShareRedirect } from '@/components/share/EditableShareRedirect';
import { PeacockStudioLoader } from '@/components/PeacockStudioLoader';
import { LANDING_PATH } from '@/constants/routes';
import { useFlowDocDefaultView } from '@/hooks/useFlowDocDefaultView';
import { usePublicShare } from '@/hooks/usePublicShare';
import { usePublicSharedDocument } from '@/hooks/usePublicSharedDocument';
import { ProductTourLearner } from '@/pages/ProductTourLearner';
import { FlowDocExperienceViews } from '@/player/FlowDocExperienceViews';
import { resolveFlowDocView } from '@/utils/resolveFlowDocView';
import { getPublicSharePath, type SharedDocumentViewMode } from '@/utils/shareLink';
import type { ResolvedShareLink } from '@/types/shareLink';

interface PublicSharePageProps {
  mode: 'view' | 'edit' | 'embed';
}

export const PublicSharePage = ({ mode }: PublicSharePageProps) => {
  const { token } = useParams<{ token: string }>();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const defaultView = useFlowDocDefaultView();
  const isEmbed = mode === 'embed';
  const { link, isLoading, error, errorTitle } = usePublicShare(token, { isEmbed });
  const { shareLinkViewMode, isReady: isDocumentReady } = usePublicSharedDocument(link);
  const resolvedView = isEmbed
    ? 'player'
    : resolveFlowDocView(searchParams, location.hash, defaultView, shareLinkViewMode);

  const handleModeChange = (nextMode: SharedDocumentViewMode) => {
    if (isEmbed) return;
    const next = new URLSearchParams(searchParams);
    next.set('view', nextMode);
    setSearchParams(next, { replace: true });
  };

  const handleHubNavigation = () => {
    if (isEmbed) return;
    const next = new URLSearchParams(searchParams);
    next.set('view', 'hub');
    setSearchParams(next, { replace: true });
  };

  if (mode === 'edit') {
    if (!token) {
      return (
        <HardErrorPage
          title="Invalid link"
          description="This edit link is missing a share token."
          homePath={LANDING_PATH}
          homeLabel="Go home"
        />
      );
    }
    return <EditableShareRedirect token={token} />;
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50">
        <PeacockStudioLoader size={160} />
        <p className="text-sm text-slate-500">
          {isEmbed ? 'Loading embedded guide…' : 'Loading shared content…'}
        </p>
      </div>
    );
  }

  if (error || !link) {
    return (
      <HardErrorPage
        title={errorTitle ?? 'Share link not found'}
        description={
          error ?? 'This link may have expired or been revoked. Ask the owner for a new link.'
        }
        homePath={LANDING_PATH}
        homeLabel="Go home"
      />
    );
  }

  // Embed-channel tokens always render under /s/:token/embed (watermark + embed_view).
  if (!isEmbed && link.channel === 'embed' && token) {
    return <Navigate to={getPublicSharePath(token, { embed: true })} replace />;
  }

  if (link.resourceType === 'tour') {
    return (
      <EmbedChrome isEmbed={isEmbed}>
        <PublicTourShareView link={link} isEmbed={isEmbed} />
      </EmbedChrome>
    );
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
    <EmbedChrome isEmbed={isEmbed}>
      <FlowDocExperienceViews
        documentId={link.resourceId}
        resolvedView={resolvedView}
        onModeChange={handleModeChange}
        onOverview={handleHubNavigation}
        showOwnerActions={false}
        isEmbed={isEmbed}
      />
    </EmbedChrome>
  );
};

const EmbedChrome = ({
  isEmbed,
  children,
}: {
  isEmbed: boolean;
  children: ReactNode;
}) => {
  if (!isEmbed) return children;
  return (
    <div className="relative min-h-screen bg-slate-50">
      {children}
      <div className="pointer-events-none absolute bottom-3 right-3 z-[60]">
        <PeacockEmbedWatermark />
      </div>
    </div>
  );
};

interface PublicTourShareViewProps {
  link: ResolvedShareLink;
  isEmbed: boolean;
}

const PublicTourShareView = ({ link, isEmbed }: PublicTourShareViewProps) => (
  <ProductTourLearner
    tourId={link.resourceId}
    isPresenter={link.settings.presenter ?? false}
    isPublicShare
    isEmbed={isEmbed}
  />
);
