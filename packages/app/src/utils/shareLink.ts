export function getDocumentShareUrl(documentId: string): string {
  return `${window.location.origin}/docs/${documentId}`;
}

export async function copyDocumentShareLink(documentId: string): Promise<void> {
  await navigator.clipboard.writeText(getDocumentShareUrl(documentId));
}
