import { describe, expect, it, vi } from 'vitest';
import type { ProductTour } from '@/types/productTour';
import type { SavedFlowDocument } from '@/types/savedFlow';
import { collectTourShareDocumentIds } from './collectTourShareDocumentIds';

function tour(features: ProductTour['features']): ProductTour {
  return {
    id: 'tour-1',
    title: 'Tour',
    description: '',
    status: 'live',
    personaId: 'p1',
    tourGoal: '',
    features,
    createdAt: 1,
    updatedAt: 2,
  };
}

describe('collectTourShareDocumentIds', () => {
  it('collects demo document ids and linked branch path targets', async () => {
    const getDocument = vi.fn(async (documentId: string) => {
      if (documentId !== 'doc-a') return undefined;
      return {
        id: 'doc-a',
        steps: [
          {
            id: 'branch-1',
            kind: 'branch',
            title: 'Branch',
            description: '',
            paths: [
              {
                id: 'path-1',
                label: 'Alt',
                targetDocumentId: 'doc-linked',
                targetTitle: 'Linked',
                targetDescription: '',
                fromStepId: 's1',
                toStepId: 's2',
                order: 0,
              },
            ],
          },
          { id: 'step-1', description: 'Click' },
        ],
      } as unknown as SavedFlowDocument;
    });

    const ids = await collectTourShareDocumentIds(
      tour([
        {
          id: 'f2',
          title: 'Second',
          description: '',
          order: 2,
          demos: [{ id: 'd2', documentId: 'doc-b', order: 0 }],
        },
        {
          id: 'f1',
          title: 'First',
          description: '',
          order: 1,
          demos: [{ id: 'd1', documentId: 'doc-a', order: 0 }],
        },
      ]),
      getDocument,
    );

    expect(ids).toEqual(['doc-a', 'doc-linked', 'doc-b']);
    expect(getDocument).toHaveBeenCalledWith('doc-a');
    expect(getDocument).toHaveBeenCalledWith('doc-b');
  });

  it('returns empty list when tour has no features', async () => {
    await expect(collectTourShareDocumentIds(tour([]), vi.fn())).resolves.toEqual([]);
  });
});
