export type SharedDocumentViewMode = 'doc' | 'player';

export function getDocumentPath(
  documentId: string,
  viewMode: SharedDocumentViewMode = 'doc'
): string {
  if (viewMode === 'player') {
    return `/docs/${documentId}?view=player`;
  }

  return `/docs/${documentId}`;
}

export function getDocumentShareUrl(
  documentId: string,
  viewMode: SharedDocumentViewMode = 'doc'
): string {
  return `${window.location.origin}${getDocumentPath(documentId, viewMode)}`;
}

export function getDocumentStepAnchor(stepId: string): string {
  return `step-${stepId}`;
}

export function getDocumentStepShareUrl(documentId: string, stepId: string): string {
  return `${getDocumentShareUrl(documentId)}#${getDocumentStepAnchor(stepId)}`;
}

export async function copyDocumentShareLink(documentId: string): Promise<void> {
  await navigator.clipboard.writeText(getDocumentShareUrl(documentId));
}
