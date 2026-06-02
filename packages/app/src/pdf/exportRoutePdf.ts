import { collectAllBranches } from '@peacock/shared';
import { getChapterNodes } from '@/utils/routeGraph';
import type { SavedRoute } from '@/types/route';
import { getFlowDocument } from '@/services/flowLibraryService';
import { exportFlowPdf } from '@/pdf/exportFlowPdf';
import { buildDefaultPdfPathSelections } from '@/utils/pdfPathSelection';

export function collectRouteDocumentIds(route: SavedRoute): string[] {
  const seen = new Set<string>();
  const ids: string[] = [];

  for (const chapter of getChapterNodes(route)) {
    for (const peacock of chapter.peacocks) {
      if (seen.has(peacock.documentId)) continue;
      seen.add(peacock.documentId);
      ids.push(peacock.documentId);
    }
  }

  return ids;
}

export async function exportRoutePdf(route: SavedRoute): Promise<void> {
  const documentIds = collectRouteDocumentIds(route);
  for (const documentId of documentIds) {
    const doc = await getFlowDocument(documentId);
    if (!doc) continue;
    await exportFlowPdf({
      flow: doc.flow,
      steps: doc.steps,
      screenshotUrls: doc.screenshotUrls,
      pathSelections: buildDefaultPdfPathSelections(collectAllBranches(doc.steps)),
    });
  }
}

export function routeHasExportablePeacocks(route: SavedRoute): boolean {
  return collectRouteDocumentIds(route).length > 0;
}
