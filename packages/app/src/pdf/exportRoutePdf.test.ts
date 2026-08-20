import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { SavedRoute } from '@/types/route';

const getFlowDocument = vi.fn();
const exportFlowPdf = vi.fn();

vi.mock('@/services/flowLibraryService', () => ({
  getFlowDocument: (...args: any[]) => (getFlowDocument as any)(...args),
}));

vi.mock('@/pdf/exportFlowPdf', () => ({
  exportFlowPdf: (...args: any[]) => (exportFlowPdf as any)(...args),
}));

import {
  collectRouteDocumentIds,
  exportRoutePdf,
  routeHasExportablePeacocks,
} from './exportRoutePdf';

function makeRoute(documentIds: string[]): SavedRoute {
  return {
    id: 'route-1',
    title: 'Route',
    description: '',
    status: 'draft',
    entryNodeId: 'chapter-1',
    nodes: [
      {
        id: 'chapter-1',
        type: 'chapter',
        title: 'Chapter',
        description: '',
        peacocks: documentIds.map((documentId, order) => ({
          id: `peacock-${order}`,
          documentId,
          order,
        })),
        position: { x: 0, y: 0 },
      },
    ],
    edges: [],
    createdAt: 1,
    updatedAt: 1,
  };
}

describe('exportRoutePdf', () => {
  beforeEach(() => {
    getFlowDocument.mockReset();
    exportFlowPdf.mockReset();
  });

  it('collects unique peacock document ids', () => {
    const route = makeRoute(['doc-a', 'doc-b', 'doc-a']);
    expect(collectRouteDocumentIds(route)).toEqual(['doc-a', 'doc-b']);
    expect(routeHasExportablePeacocks(route)).toBe(true);
    expect(routeHasExportablePeacocks(makeRoute([]))).toBe(false);
  });

  it('exports each loaded document as a PDF', async () => {
    const route = makeRoute(['doc-a', 'doc-b']);
    getFlowDocument
      .mockResolvedValueOnce({
        flow: {
          flow: {
            title: 'A',
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
        screenshotUrls: {},
      })
      .mockResolvedValueOnce(null);

    await exportRoutePdf(route);

    expect(getFlowDocument).toHaveBeenCalledTimes(2);
    expect(exportFlowPdf).toHaveBeenCalledTimes(1);
    expect(exportFlowPdf).toHaveBeenCalledWith(
      expect.objectContaining({
        screenshotUrls: {},
        pathSelections: expect.any(Object),
      }),
    );
  });
});
