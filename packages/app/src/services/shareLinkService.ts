import { isCloudSyncEnabled } from '@/cloud/config';
import { createOrUpdateShareLink } from '@/cloud/repositories/shareLinkRepository';
import { getFlowDocument } from '@/storage/libraryRouter';
import { getProductTour } from '@/storage/libraryRouter';
import type { CreateShareLinkInput, ShareLinkRecord } from '@/types/shareLink';
import type { FlowShareSettings } from '@/types/savedFlow';
import { collectTourShareDocumentIds } from '@/utils/collectTourShareDocumentIds';
import {
  buildEmbedIframeCode,
  buildPublicShareUrl,
  buildSharedDocumentUrl,
  buildSharedProductTourUrl,
  type ShareLinkAccessMode,
  type SharedDocumentViewMode,
} from '@/utils/shareLink';

interface ShareSecurityOptions {
  expiresAt?: string | null;
  requiresAuth?: boolean;
}

interface DocumentShareLinkOptions extends ShareSecurityOptions {
  accessMode: ShareLinkAccessMode;
  viewMode?: SharedDocumentViewMode;
  shareSettings?: FlowShareSettings;
  presenter?: boolean;
}

interface ProductTourShareLinkOptions extends ShareSecurityOptions {
  accessMode: ShareLinkAccessMode;
  presenter?: boolean;
}

export async function createDocumentShareUrl(
  documentId: string,
  options: DocumentShareLinkOptions,
): Promise<string> {
  await assertDocumentShareable(documentId);

  if (!isCloudSyncEnabled()) {
    const queryParts: string[] = [];
    if (options.shareSettings && options.accessMode === 'readonly') {
      const branchQuery = buildBranchQueryFromSettings(options.shareSettings);
      if (branchQuery) queryParts.push(branchQuery.replace(/^\?/, ''));
    }
    if (options.presenter) queryParts.push('presenter=1');
    const query = queryParts.length > 0 ? `?${queryParts.join('&')}` : '';
    return buildSharedDocumentUrl(documentId, {
      accessMode: options.accessMode,
      viewMode: options.presenter ? 'player' : options.viewMode,
      query,
    });
  }

  const link = await createOrUpdateShareLink({
    resourceType: 'document',
    resourceId: documentId,
    accessMode: options.accessMode,
    channel: 'link',
    expiresAt: options.expiresAt,
    requiresAuth: options.requiresAuth,
    settings: {
      viewMode: options.presenter ? 'player' : (options.viewMode ?? 'doc'),
      shareSettings: options.shareSettings,
      presenter: options.presenter ?? false,
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

  await assertDocumentShareable(documentId);

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

async function assertDocumentShareable(documentId: string): Promise<void> {
  const doc = await getFlowDocument(documentId);
  if (!doc) throw new Error('Documentation not found.');
  if (doc.status !== 'live') {
    throw new Error('Publish this documentation to Live before sharing publicly.');
  }
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
    expiresAt: options.expiresAt,
    requiresAuth: options.requiresAuth,
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
