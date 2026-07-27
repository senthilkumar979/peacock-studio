import type { ReactNode } from 'react';
import { Navigate, useLocation, useParams, useSearchParams } from 'react-router-dom';
import { isPublicShareFeatureEnabled } from '@/analytics/featureFlags';
import { shouldShowEmbedWatermark } from '@/cloud/planLimits';
import { PeacockEmbedWatermark } from '@/components/embed/PeacockEmbedWatermark';
import { AppErrorBoundary } from '@/components/errors/AppErrorBoundary';
import { HardErrorPage } from '@/components/errors/HardErrorPage';
import { EditableShareRedirect } from '@/components/share/EditableShareRedirect';
import { ShareAuthRequiredGate } from '@/components/share/ShareAuthRequiredGate';
import { PeacockStudioLoader } from '@/components/PeacockStudioLoader';
import { isCloudSyncFlagEnabled } from '@/cloud/config';
import { LANDING_PATH } from '@/constants/routes';
import { useFlowDocDefaultView } from '@/hooks/useFlowDocDefaultView';
import { usePublicShare } from '@/hooks/usePublicShare';
import { usePublicSharedDocument } from '@/hooks/usePublicSharedDocument';
import { ProductTourLearner } from '@/pages/ProductTourLearner';
import { FlowDocExperienceViews } from '@/player/FlowDocExperienceViews';
import { resolveFlowDocView } from '@/utils/resolveFlowDocView';
import { getPublicSharePath, type SharedDocumentViewMode } from '@/utils/shareLink';
import type { ResolvedShareLink } from '@/types/shareLink';

export interface PublicSharePageProps {
  mode: 'view' | 'edit' | 'embed';
}

export const PublicSharePage = ({ mode }: PublicSharePageProps) => {
  const { token } = useParams<{ token: string }>();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const defaultView = useFlowDocDefaultView();
  const isEmbed = mode === 'embed';
  const shareKillSwitched = isCloudSyncFlagEnabled() && !isPublicShareFeatureEnabled();
  const { link, isLoading, error, errorTitle, requiresSignIn } = usePublicShare(
    shareKillSwitched ? undefined : token,
    { isEmbed },
  );
  const { shareLinkViewMode, isReady: isDocumentReady } = usePublicSharedDocument(
    requiresSignIn || shareKillSwitched ? null : link,
  );
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

  if (shareKillSwitched) {
    return (
      <HardErrorPage
        title="Sharing unavailable"
        description="Public share links are temporarily disabled. Ask the owner for another way to view this guide."
        homePath={LANDING_PATH}
        homeLabel="Go home"
      />
    );
  }

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

  if (requiresSignIn) {
    return <ShareAuthRequiredGate returnPath={location.pathname + location.search} />;
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

  return (
    <AppErrorBoundary
      compact
      title="Shared view crashed"
      description="A rendering error stopped this shared view. You can retry or return home."
      homePath={LANDING_PATH}
      homeLabel="Go home"
    >
      {link.resourceType === 'tour' ? (
        <EmbedChrome isEmbed={isEmbed}>
          <PublicTourShareView link={link} isEmbed={isEmbed} />
        </EmbedChrome>
      ) : !isDocumentReady ? (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50">
          <PeacockStudioLoader size={160} />
          <p className="text-sm text-slate-500">Loading documentation…</p>
        </div>
      ) : (
        <EmbedChrome isEmbed={isEmbed}>
          <FlowDocExperienceViews
            documentId={link.resourceId}
            resolvedView={resolvedView}
            onModeChange={handleModeChange}
            onOverview={handleHubNavigation}
            showOwnerActions={false}
            isEmbed={isEmbed}
            isPresenter={link.settings.presenter ?? false}
          />
        </EmbedChrome>
      )}
    </AppErrorBoundary>
  );
};

const EmbedChrome = ({
  isEmbed,
  plan,
  children,
}: {
  isEmbed: boolean;
  /** When share resolution exposes a plan, paid orgs hide watermark chrome. */
  plan?: string | null;
  children: ReactNode;
}) => {
  if (!isEmbed) return children;
  const showWatermark = shouldShowEmbedWatermark(plan);
  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-slate-50">
      <div className="min-h-0 flex-1 overflow-hidden px-0 pt-0">{children}</div>
      {showWatermark ? (
        <footer className="flex shrink-0 items-center justify-center border-t border-slate-200/80 bg-white/95 px-3 py-2">
          <PeacockEmbedWatermark plan={plan} />
        </footer>
      ) : null}
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
