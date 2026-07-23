import { isCloudSyncEnabled } from '@/cloud/config';
import { createOrUpdateShareLink } from '@/cloud/repositories/shareLinkRepository';
import { getFlowDocument } from '@/storage/libraryRouter';
import { getProductTour } from '@/storage/libraryRouter';
import type { CreateShareLinkInput, ShareLinkRecord } from '@/types/shareLink';
import type { FlowShareSettings } from '@/types/savedFlow';
import type { ProductTour } from '@/types/productTour';
import { collectTourShareDocumentIds } from '@/utils/collectTourShareDocumentIds';
import {
  buildEmbedIframeCode,
  buildPublicShareUrl,
  buildSharedDocumentUrl,
  buildSharedProductTourUrl,
  type ShareLinkAccessMode,
  type SharedDocumentViewMode,
} from '@/utils/shareLink';

interface DocumentShareLinkOptions {
  accessMode: ShareLinkAccessMode;
  viewMode?: SharedDocumentViewMode;
  shareSettings?: FlowShareSettings;
}

interface ProductTourShareLinkOptions {
  accessMode: ShareLinkAccessMode;
  presenter?: boolean;
}

export async function createDocumentShareUrl(
  documentId: string,
  options: DocumentShareLinkOptions,
): Promise<string> {
  if (!isCloudSyncEnabled()) {
    const query =
      options.shareSettings && options.accessMode === 'readonly'
        ? buildBranchQueryFromSettings(options.shareSettings)
        : '';
    return buildSharedDocumentUrl(documentId, {
      accessMode: options.accessMode,
      viewMode: options.viewMode,
      query,
    });
  }

  const link = await createOrUpdateShareLink({
    resourceType: 'document',
    resourceId: documentId,
    accessMode: options.accessMode,
    channel: 'link',
    settings: {
      viewMode: options.viewMode ?? 'doc',
      shareSettings: options.shareSettings,
    },
  });

  return buildPublicShareUrl(link.token, { editable: options.accessMode === 'editable' });
}

export async function createDocumentEmbedCode(
  documentId: string,
  options: { title?: string; shareSettings?: FlowShareSettings } = {},
): Promise<{ embedUrl: string; iframeCode: string }> {
  if (!isCloudSyncEnabled()) {
    throw new Error('Embeds require cloud sync and an Embed capability in your workspace.');
  }

  const link = await createOrUpdateShareLink({
    resourceType: 'document',
    resourceId: documentId,
    accessMode: 'readonly',
    channel: 'embed',
    settings: {
      viewMode: 'player',
      shareSettings: options.shareSettings,
    },
  });

  const embedUrl = buildPublicShareUrl(link.token, { embed: true });
  return {
    embedUrl,
    iframeCode: buildEmbedIframeCode(embedUrl, options.title ?? 'Peacock Studio guide'),
  };
}

export async function createProductTourShareUrl(
  tourId: string,
  options: ProductTourShareLinkOptions,
): Promise<string> {
  if (!isCloudSyncEnabled()) {
    return buildSharedProductTourUrl(tourId, options.accessMode, {
      presenter: options.presenter,
    });
  }

  const tour = await getProductTour(tourId);
  if (!tour) {
    throw new Error('Product tour not found.');
  }

  const allowedDocumentIds = await collectTourShareDocumentIds(tour, getFlowDocument);
  const link = await createOrUpdateShareLink({
    resourceType: 'tour',
    resourceId: tourId,
    accessMode: options.accessMode,
    channel: 'link',
    settings: {
      presenter: options.presenter ?? false,
      allowedDocumentIds,
    },
  });

  return buildPublicShareUrl(link.token, { editable: options.accessMode === 'editable' });
}

export async function createProductTourEmbedCode(
  tourId: string,
  options: { title?: string } = {},
): Promise<{ embedUrl: string; iframeCode: string }> {
  if (!isCloudSyncEnabled()) {
    throw new Error('Embeds require cloud sync and an Embed capability in your workspace.');
  }

  const tour = await getProductTour(tourId);
  if (!tour) {
    throw new Error('Product tour not found.');
  }

  const allowedDocumentIds = await collectTourShareDocumentIds(tour, getFlowDocument);
  const link = await createOrUpdateShareLink({
    resourceType: 'tour',
    resourceId: tourId,
    accessMode: 'readonly',
    channel: 'embed',
    settings: {
      presenter: false,
      allowedDocumentIds,
    },
  });

  const embedUrl = buildPublicShareUrl(link.token, { embed: true });
  return {
    embedUrl,
    iframeCode: buildEmbedIframeCode(
      embedUrl,
      options.title ?? (tour.title || 'Peacock Studio tour'),
    ),
  };
}

function buildBranchQueryFromSettings(settings: FlowShareSettings): string {
  const params = new URLSearchParams();
  if (settings.enabledPathIds.length) params.set('paths', settings.enabledPathIds.join(','));
  if (settings.enabledBranchIds.length) params.set('branches', settings.enabledBranchIds.join(','));
  const query = params.toString();
  return query ? `?${query}` : '';
}

export type { ShareLinkRecord, CreateShareLinkInput };
