import { useEffect } from 'react';
import { getPlayableSteps, getStepScreenshotUrl } from '@peacock/shared';
import { PEACOCK_APP_NAME } from '@/constants/branding';
import { absoluteUrl, ogImageUrl } from '@/constants/site';
import { useSavedProductTour } from '@/hooks/useSavedProductTour';
import { applyMetaTags, setDocumentTitle } from '@/seo/applyHeadMeta';
import { buildSocialMetaTags } from '@/seo/socialMetaTags';
import type { RouteMeta } from '@/seo/routeMetaData';
import { useFlowStore } from '@/store/flowStore';
import type { ResolvedShareLink } from '@/types/shareLink';
import { stripHtmlTags } from '@/utils/richText';

interface ShareDocumentMetaProps {
  link: ResolvedShareLink | null;
  isDocumentReady: boolean;
  sharePath: string;
}

function buildDocumentShareMeta(
  sharePath: string,
  title: string,
  description: string,
  image?: string,
): RouteMeta {
  const trimmedTitle = title.trim() || 'Shared guide';
  const trimmedDescription =
    stripHtmlTags(description).trim() ||
    'Interactive workflow documentation shared from Peacock Studio.';

  return {
    title: `${trimmedTitle} · ${PEACOCK_APP_NAME}`,
    description: trimmedDescription.slice(0, 300),
    path: sharePath,
    robots: 'noindex,nofollow',
    canonical: absoluteUrl(sharePath),
    ogImage: image ?? ogImageUrl(),
    ogImageAlt: trimmedTitle,
    ogType: 'article',
  };
}

export const ShareDocumentMeta = ({
  link,
  isDocumentReady,
  sharePath,
}: ShareDocumentMetaProps) => {
  const flow = useFlowStore((state) => state.flow);
  const steps = useFlowStore((state) => state.steps);
  const screenshotUrls = useFlowStore((state) => state.screenshotUrls);
  const tourQuery = useSavedProductTour(
    link?.resourceType === 'tour' ? link.resourceId : undefined,
  );

  useEffect(() => {
    if (!link) return;

    let meta: RouteMeta | null = null;

    if (link.resourceType === 'document' && isDocumentReady && flow) {
      const playable = getPlayableSteps(steps);
      const firstScreenshot = playable[0]
        ? getStepScreenshotUrl(playable[0], screenshotUrls) || undefined
        : undefined;

      meta = buildDocumentShareMeta(
        sharePath,
        flow.flow.title,
        flow.flow.description,
        firstScreenshot,
      );
    }

    if (link.resourceType === 'tour' && tourQuery.isLoaded && tourQuery.tour) {
      meta = buildDocumentShareMeta(
        sharePath,
        tourQuery.tour.title,
        tourQuery.tour.description,
      );
    }

    if (!meta) return;

    setDocumentTitle(meta.title);
    applyMetaTags(buildSocialMetaTags(meta));
  }, [link, isDocumentReady, flow, steps, screenshotUrls, tourQuery.isLoaded, tourQuery.tour, sharePath]);

  return null;
};
