export type SharedDocumentViewMode = 'doc' | 'player';
export type FlowDocViewMode = 'hub' | SharedDocumentViewMode;
export type ShareLinkAccessMode = 'readonly' | 'editable';
export type ShareLinkChannel = 'link' | 'embed';

export const PUBLIC_SHARE_PATH = '/s' as const;

export function getPublicSharePath(
  token: string,
  options: { editable?: boolean; embed?: boolean } = {},
): string {
  if (options.embed) return `${PUBLIC_SHARE_PATH}/${token}/embed`;
  return options.editable
    ? `${PUBLIC_SHARE_PATH}/${token}/edit`
    : `${PUBLIC_SHARE_PATH}/${token}`;
}

export function buildPublicShareUrl(
  token: string,
  options: { editable?: boolean; embed?: boolean } = {},
): string {
  return `${window.location.origin}${getPublicSharePath(token, options)}`;
}

export function buildEmbedIframeCode(embedUrl: string, title = 'Peacock Studio guide'): string {
  const safeTitle = title.replace(/"/g, '&quot;');
  return `<iframe
  src="${embedUrl}"
  title="${safeTitle}"
  width="100%"
  height="640"
  style="border:0;border-radius:12px;overflow:hidden;"
  loading="lazy"
  allowfullscreen
></iframe>`;
}

export function getDocumentEditPath(documentId: string): string {
  return `/docs/${documentId}/edit`;
}

export function getDocumentPath(
  documentId: string,
  viewMode?: FlowDocViewMode,
): string {
  if (!viewMode || viewMode === 'hub') {
    return `/docs/${documentId}`;
  }

  return `/docs/${documentId}?view=${viewMode}`;
}

export function getDocumentHubPath(documentId: string): string {
  return `/docs/${documentId}?view=hub`;
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

export function getLinkedDocumentPathAnchor(pathId: string): string {
  return `linked-path-${pathId}`;
}

export function getLinkedDocumentStepAnchor(pathId: string, stepId: string): string {
  return `linked-${pathId}-${stepId}`;
}

export function getDocumentAnchorShareUrl(documentId: string, anchorId: string): string {
  return `${buildSharedDocumentUrl(documentId, { viewMode: 'doc' })}#${anchorId}`;
}

export function getDocumentStepShareUrl(documentId: string, stepId: string): string {
  return getDocumentAnchorShareUrl(documentId, getDocumentStepAnchor(stepId));
}

export function getLinkedDocumentStepShareUrl(
  documentId: string,
  pathId: string,
  stepId: string,
): string {
  return getDocumentAnchorShareUrl(documentId, getLinkedDocumentStepAnchor(pathId, stepId));
}

const DOCUMENT_ANCHOR_UUID =
  '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}';

export function parseLinkedDocumentPathAnchor(anchorId: string): string | null {
  const match = anchorId.match(new RegExp(`^linked-path-(${DOCUMENT_ANCHOR_UUID})$`, 'i'));
  return match?.[1] ?? null;
}

export function parseLinkedDocumentStepAnchor(
  anchorId: string,
): { pathId: string; stepId: string } | null {
  const match = anchorId.match(
    new RegExp(`^linked-(${DOCUMENT_ANCHOR_UUID})-(${DOCUMENT_ANCHOR_UUID})$`, 'i'),
  );
  if (!match?.[1] || !match[2]) return null;
  return { pathId: match[1], stepId: match[2] };
}

export function resolveLinkedPathIdFromAnchor(anchorId: string): string | null {
  return parseLinkedDocumentPathAnchor(anchorId) ?? parseLinkedDocumentStepAnchor(anchorId)?.pathId ?? null;
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

export async function copyTextToClipboard(text: string): Promise<void> {
  await navigator.clipboard.writeText(text);
}
