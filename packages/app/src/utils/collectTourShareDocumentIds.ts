import { isFlowBranch } from '@peacock/shared';
import type { ProductTour } from '@/types/productTour';
import type { SavedFlowDocument } from '@/types/savedFlow';
import { sortTourFeatures } from '@/utils/createProductTour';

export async function collectTourShareDocumentIds(
  tour: ProductTour,
  getDocument: (documentId: string) => Promise<SavedFlowDocument | undefined>,
): Promise<string[]> {
  const ids = new Set<string>();

  for (const feature of sortTourFeatures(tour.features)) {
    for (const demo of feature.demos) {
      ids.add(demo.documentId);

      const doc = await getDocument(demo.documentId);
      if (!doc) continue;

      for (const item of doc.steps) {
        if (!isFlowBranch(item)) continue;
        for (const path of item.paths) {
          ids.add(path.targetDocumentId);
        }
      }
    }
  }

  return [...ids];
}
