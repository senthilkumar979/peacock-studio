import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ProductTour } from '@/types/productTour';

const collectProductTourDocumentIds = vi.fn();
const getProductTour = vi.fn();
const getFlowDocument = vi.fn();
const exportFlowPdf = vi.fn();

vi.mock('@/storage/libraryRouter', () => ({
  collectProductTourDocumentIds: (...args: any[]) =>
    collectProductTourDocumentIds(...args),
  getProductTour: (...args: any[]) => (getProductTour as any)(...args),
}));

vi.mock('@/services/flowLibraryService', () => ({
  getFlowDocument: (...args: any[]) => (getFlowDocument as any)(...args),
}));

vi.mock('@/pdf/exportFlowPdf', () => ({
  exportFlowPdf: (...args: any[]) => (exportFlowPdf as any)(...args),
}));

import {
  exportProductTourPdf,
  loadProductTourForShare,
  tourHasExportableDemos,
} from './exportProductTourPdf';

const tour: ProductTour = {
  id: 'tour-1',
  title: 'Tour',
  description: '',
  status: 'draft',
  personaId: 'persona-1',
  tourGoal: 'Learn',
  features: [],
  createdAt: 1,
  updatedAt: 1,
};

describe('exportProductTourPdf', () => {
  beforeEach(() => {
    collectProductTourDocumentIds.mockReset();
    getProductTour.mockReset();
    getFlowDocument.mockReset();
    exportFlowPdf.mockReset();
  });

  it('reports whether the tour has exportable demos', () => {
    collectProductTourDocumentIds.mockReturnValue(['doc-1']);
    expect(tourHasExportableDemos(tour)).toBe(true);
    collectProductTourDocumentIds.mockReturnValue([]);
    expect(tourHasExportableDemos(tour)).toBe(false);
  });

  it('exports each loaded demo document', async () => {
    collectProductTourDocumentIds.mockReturnValue(['doc-1', 'doc-2']);
    getFlowDocument
      .mockResolvedValueOnce({
        flow: {
          flow: {
            title: 'One',
            description: '',
            version: '1',
            category: '',
            tags: [],
          },
          metadata: {
            createdAt: 1,
            browser: 'Chrome',
            platform: 'MacIntel',
            screen: { width: 1, height: 1 },
          },
          steps: [],
        },
        steps: [],
        screenshotUrls: { s: 'https://example.com/s.png' },
      })
      .mockResolvedValueOnce(null);

    await exportProductTourPdf(tour);

    expect(exportFlowPdf).toHaveBeenCalledTimes(1);
  });

  it('loads a tour for share', async () => {
    getProductTour.mockResolvedValue(tour);
    await expect(loadProductTourForShare('tour-1')).resolves.toEqual(tour);
    getProductTour.mockResolvedValue(undefined);
    await expect(loadProductTourForShare('missing')).resolves.toBeNull();
  });
});
