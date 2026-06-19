export type SharedDocumentViewMode = 'doc' | 'player';
export type ShareLinkAccessMode = 'readonly' | 'editable';

export function getDocumentEditPath(documentId: string): string {
  return `/docs/${documentId}/edit`;
}

export function getDocumentPath(
  documentId: string,
  viewMode: SharedDocumentViewMode = 'doc',
): string {
  if (viewMode === 'player') {
    return `/docs/${documentId}?view=player`;
  }

  return `/docs/${documentId}`;
}

export function buildSharedDocumentUrl(
  documentId: string,
  options: {
    accessMode?: ShareLinkAccessMode;
    viewMode?: SharedDocumentViewMode;
    query?: string;
  } = {},
): string {
  const accessMode = options.accessMode ?? 'readonly';
  const viewMode = options.viewMode ?? 'doc';
  const query = options.query ?? '';
  const path =
    accessMode === 'editable'
      ? getDocumentEditPath(documentId)
      : getDocumentPath(documentId, viewMode);

  return `${window.location.origin}${path}${query}`;
}

/** @deprecated Use buildSharedDocumentUrl */
export function getDocumentShareUrl(
  documentId: string,
  viewMode: SharedDocumentViewMode = 'doc',
  query = '',
): string {
  return buildSharedDocumentUrl(documentId, { viewMode, query });
}

export function getDocumentFlowDetailsAnchor(): string {
  return 'flow-details';
}

export const FLOW_DETAILS_OUTLINE_ID = 'flow-details';

export function getDocumentStepAnchor(stepId: string): string {
  return `step-${stepId}`;
}

export function getDocumentStepShareUrl(documentId: string, stepId: string): string {
  return `${buildSharedDocumentUrl(documentId)}#${getDocumentStepAnchor(stepId)}`;
}

export function getEmbedCodePlaceholder(documentId: string): string {
  return `<!-- Peacock embed — coming soon -->\n<div data-peacock-doc="${documentId}"></div>`;
}

export function getRouteEmbedCodePlaceholder(routeId: string): string {
  return `<!-- Peacock route embed — coming soon -->\n<div data-peacock-route="${routeId}"></div>`;
}

export function buildSharedRouteUrl(
  routeId: string,
  accessMode: ShareLinkAccessMode = 'readonly',
): string {
  const path = accessMode === 'editable' ? `/routes/${routeId}/edit` : `/routes/${routeId}`;
  return `${window.location.origin}${path}`;
}

export function buildSharedProductTourUrl(
  tourId: string,
  accessMode: ShareLinkAccessMode = 'readonly',
  options: { presenter?: boolean } = {},
): string {
  const base =
    accessMode === 'editable' ? `/tours/${tourId}/edit` : `/tours/${tourId}`;
  const params = new URLSearchParams();
  if (options.presenter) params.set('presenter', '1');
  const query = params.toString();
  return `${window.location.origin}${base}${query ? `?${query}` : ''}`;
}

export function getProductTourEmbedCodePlaceholder(tourId: string): string {
  return `<!-- Peacock product tour embed — coming soon -->\n<div data-peacock-tour="${tourId}"></div>`;
}

export async function copyTextToClipboard(text: string): Promise<void> {
  await navigator.clipboard.writeText(text);
}
