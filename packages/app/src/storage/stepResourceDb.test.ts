import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { StepResource } from '@peacock/shared';

const store = new Map<string, StepResource>();

function createMockDb() {
  const indexGetAll = async (indexName: 'by-document' | 'by-step', key: string) =>
    [...store.values()].filter((resource) =>
      indexName === 'by-document' ? resource.documentId === key : resource.stepId === key,
    );

  return {
    getAllFromIndex: vi.fn(async (_store: string, indexName: 'by-document' | 'by-step', key: string) =>
      indexGetAll(indexName, key),
    ),
    transaction: vi.fn((storeName: string, mode: string) => {
      expect(storeName).toBe('step_resources');
      expect(mode).toBe('readwrite');
      const txStore = {
        index: (indexName: 'by-document' | 'by-step') => ({
          getAll: (key: string) => indexGetAll(indexName, key),
        }),
        delete: vi.fn(async (id: string) => {
          store.delete(id);
        }),
        put: vi.fn(async (resource: StepResource) => {
          store.set(resource.id, resource);
        }),
      };
      return {
        store: txStore,
        done: Promise.resolve(),
      };
    }),
  };
}

vi.mock('@/storage/flowLibraryDb', () => ({
  getFlowLibraryDb: vi.fn(async () => createMockDb()),
}));

vi.mock('@peacock/shared', async () => {
  const actual = await vi.importActual<typeof import('@peacock/shared')>('@peacock/shared');
  let n = 0;
  return {
    ...actual,
    createId: () => `copied-${++n}`,
  };
});

import {
  copyResources,
  deleteResourcesForDocument,
  deleteResourcesForStep,
  listResourcesByDocument,
  replaceDocumentResources,
} from './stepResourceDb';

function resource(partial: Partial<StepResource> & Pick<StepResource, 'id' | 'documentId' | 'stepId'>): StepResource {
  return {
    url: 'https://example.com',
    sortOrder: 0,
    createdAt: 1,
    ...partial,
  };
}

describe('stepResourceDb', () => {
  beforeEach(() => {
    store.clear();
    vi.clearAllMocks();
  });

  it('lists resources sorted by sortOrder then createdAt', async () => {
    store.set('b', resource({ id: 'b', documentId: 'doc', stepId: 's1', sortOrder: 1, createdAt: 1 }));
    store.set('a', resource({ id: 'a', documentId: 'doc', stepId: 's1', sortOrder: 0, createdAt: 5 }));
    store.set('c', resource({ id: 'c', documentId: 'other', stepId: 's1', sortOrder: 0, createdAt: 1 }));

    await expect(listResourcesByDocument('doc')).resolves.toEqual([
      expect.objectContaining({ id: 'a' }),
      expect.objectContaining({ id: 'b' }),
    ]);
  });

  it('replaceDocumentResources replaces existing rows for a document', async () => {
    store.set('old', resource({ id: 'old', documentId: 'doc', stepId: 's1' }));
    const next = [resource({ id: 'new', documentId: 'ignored', stepId: 's2', sortOrder: 3 })];

    await replaceDocumentResources('doc', next);

    expect([...store.keys()]).toEqual(['new']);
    expect(store.get('new')?.documentId).toBe('doc');
    expect(store.get('new')?.stepId).toBe('s2');
  });

  it('deleteResourcesForStep only deletes matching document+step rows', async () => {
    store.set('keep-other-doc', resource({ id: 'keep-other-doc', documentId: 'other', stepId: 's1' }));
    store.set('keep-other-step', resource({ id: 'keep-other-step', documentId: 'doc', stepId: 's2' }));
    store.set('drop', resource({ id: 'drop', documentId: 'doc', stepId: 's1' }));

    await deleteResourcesForStep('doc', 's1');

    expect([...store.keys()].sort()).toEqual(['keep-other-doc', 'keep-other-step']);
  });

  it('deleteResourcesForDocument removes all rows for a document', async () => {
    store.set('a', resource({ id: 'a', documentId: 'doc', stepId: 's1' }));
    store.set('b', resource({ id: 'b', documentId: 'other', stepId: 's1' }));

    await deleteResourcesForDocument('doc');

    expect([...store.keys()]).toEqual(['b']);
  });

  it('copyResources clones source rows onto a target document with new ids', async () => {
    store.set('src', resource({ id: 'src', documentId: 'source', stepId: 's1', url: 'https://a.test/x', sortOrder: 2, createdAt: 9 }));

    await copyResources('source', 'target');

    const copied = [...store.values()].filter((item) => item.documentId === 'target');
    expect(copied).toHaveLength(1);
    expect(copied[0]?.id).toBe('copied-1');
    expect(copied[0]?.url).toBe('https://a.test/x');
    expect(copied[0]?.stepId).toBe('s1');
    expect(copied[0]?.sortOrder).toBe(2);
    expect(store.get('src')).toBeTruthy();
  });
});
