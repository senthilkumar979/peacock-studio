import { collectAllBranches } from '@peacock/shared';
import { collectProductTourDocumentIds, getProductTour } from '@/storage/libraryRouter';
import type { ProductTour } from '@/types/productTour';
import { exportFlowPdf } from '@/pdf/exportFlowPdf';
import { getFlowDocument } from '@/services/flowLibraryService';
import { buildDefaultPdfPathSelections } from '@/utils/pdfPathSelection';

export async function exportProductTourPdf(tour: ProductTour): Promise<void> {
  const documentIds = collectProductTourDocumentIds(tour);
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

export function tourHasExportableDemos(tour: ProductTour): boolean {
  return collectProductTourDocumentIds(tour).length > 0;
}

export async function loadProductTourForShare(tourId: string): Promise<ProductTour | null> {
  return (await getProductTour(tourId)) ?? null;
}
