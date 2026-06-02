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

export async function copyTextToClipboard(text: string): Promise<void> {
  await navigator.clipboard.writeText(text);
}
