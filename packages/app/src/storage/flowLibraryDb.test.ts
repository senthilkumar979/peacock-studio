import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { FlowPayload, FlowStep, StepResource } from '@peacock/shared';
import type { SavedFlowDocument } from '@/types/savedFlow';
import type { Persona } from '@/types/persona';
import type { ProductTour } from '@/types/productTour';
import type { SavedRoute } from '@/types/route';
import { DEFAULT_PERSONA_ID } from '@/constants/personaAvatars';

type StoreName = 'documents' | 'routes' | 'personas' | 'productTours' | 'step_resources';

const stores: Record<StoreName, Map<string, unknown>> = {
  documents: new Map(),
  routes: new Map(),
  personas: new Map(),
  productTours: new Map(),
  step_resources: new Map(),
};

const listResourcesByDocument = vi.fn(async () => [] as StepResource[]);
const replaceDocumentResources = vi.fn(async () => undefined);
const deleteResourcesForDocument = vi.fn(async () => undefined);

vi.mock('@/storage/stepResourceDb', () => ({
  listResourcesByDocument: (...args: any[]) => (listResourcesByDocument as any)(...args),
  replaceDocumentResources: (...args: any[]) => (replaceDocumentResources as any)(...args),
  deleteResourcesForDocument: (...args: any[]) => (deleteResourcesForDocument as any)(...args),
}));

vi.mock('@/utils/productTourLearner', () => ({
  estimateTourDurationMinutes: async () => 3,
}));

vi.mock('idb', () => ({
  openDB: vi.fn(async (_name: string, _version: number, options?: { upgrade?: (db: unknown, oldVersion: number) => void }) => {
    const fakeDb = {
      objectStoreNames: {
        contains: (name: string) => true,
      },
      createObjectStore: vi.fn(() => ({ createIndex: vi.fn() })),
      get: async (store: StoreName, key: string) => stores[store].get(key),
      put: async (store: StoreName, value: { id: string }) => {
        stores[store].set(value.id, value);
      },
      delete: async (store: StoreName, key: string) => {
        stores[store].delete(key);
      },
      getAll: async (store: StoreName) => [...stores[store].values()],
      getAllFromIndex: async (store: StoreName, _index: string) => {
        const values = [...stores[store].values()] as Array<{ updatedAt?: number }>;
        return values.sort((a, b) => (a.updatedAt ?? 0) - (b.updatedAt ?? 0));
      },
    };
    options?.upgrade?.(fakeDb, 0);
    return fakeDb;
  }),
}));

function makeStep(id: string): FlowStep {
  return {
    id,
    title: id,
    notes: '',
    generatedTitle: id,
    generatedDescription: '',
    screenshotId: `${id}-shot`,
    event: {
      id: `${id}-ev`,
      type: 'page-view',
      timestamp: 1,
      url: 'https://example.com',
      title: 'Page',
      viewport: { width: 1, height: 1, scrollX: 0, scrollY: 0, dpr: 1 },
      screenshotId: `${id}-shot`,
    },
  };
}

function makeFlow(title = 'Doc'): FlowPayload {
  return {
    flow: { title, description: 'desc', version: '1.0.0', category: 'general', tags: [] },
    metadata: {
      createdAt: 10,
      browser: 't',
      platform: 't',
      screen: { width: 1, height: 1 },
    },
    steps: [],
  };
}

function makeDoc(id: string, updatedAt = 100): SavedFlowDocument {
  const step = makeStep('s1');
  return {
    id,
    savedAt: 1,
    updatedAt,
    status: 'live',
    flow: makeFlow(id),
    steps: [step],
    screenshotUrls: {},
  };
}

describe('flowLibraryDb', () => {
  beforeEach(async () => {
    vi.resetModules();
    for (const store of Object.values(stores)) store.clear();
    listResourcesByDocument.mockReset().mockResolvedValue([]);
    replaceDocumentResources.mockReset().mockResolvedValue(undefined);
    deleteResourcesForDocument.mockReset().mockResolvedValue(undefined);
  });

  async function load() {
    return import('./flowLibraryDb');
  }

  it('toFlowSummary and document CRUD with resources', async () => {
    const db = await load();
    const doc = makeDoc('doc-1', 50);
    expect(db.toFlowSummary(doc)).toMatchObject({
      id: 'doc-1',
      title: 'doc-1',
      stepCount: 1,
      status: 'live',
    });

    const resources: StepResource[] = [
      {
        id: 'r1',
        documentId: 'doc-1',
        stepId: 's1',
        url: 'https://x',
        sortOrder: 0,
        createdAt: 1,
      },
    ];
    await db.saveFlowDocument({ ...doc, stepResources: resources });
    expect(replaceDocumentResources).toHaveBeenCalledWith('doc-1', resources);

    listResourcesByDocument.mockResolvedValue(resources);
    const loaded = await db.getFlowDocument('doc-1');
    expect(loaded?.stepResources).toEqual(resources);

    await db.saveFlowDocument(makeDoc('doc-2', 90));
    const summaries = await db.listFlowSummaries();
    expect(summaries.map((s) => s.id)).toEqual(['doc-2', 'doc-1']);

    await db.deleteFlowDocument('doc-1');
    expect(deleteResourcesForDocument).toHaveBeenCalledWith('doc-1');
    await expect(db.getFlowDocument('doc-1')).resolves.toBeUndefined();
  });

  it('persona CRUD seeds default and blocks deleting default', async () => {
    const db = await load();
    const personas = await db.listPersonas();
    expect(personas.some((p) => p.id === DEFAULT_PERSONA_ID)).toBe(true);

    await db.savePersona({
      id: 'p2',
      name: 'Pat',
      occupation: 'Dev',
      shortBio: 'bio',
      gender: 'neutral',
      avatarId: 'neutral',
      createdAt: 1,
      updatedAt: 1,
    } as Persona);

    await expect(db.getPersona('p2')).resolves.toMatchObject({ name: 'Pat' });
    await db.deletePersona(DEFAULT_PERSONA_ID);
    await expect(db.getPersona(DEFAULT_PERSONA_ID)).resolves.toBeTruthy();
    await db.deletePersona('p2');
    await expect(db.getPersona('p2')).resolves.toBeUndefined();
  });

  it('product tour CRUD and collect ids', async () => {
    const db = await load();
    const tour: ProductTour = {
      id: 'tour-1',
      title: 'Tour',
      description: '',
      status: 'draft',
      personaId: DEFAULT_PERSONA_ID,
      tourGoal: 'learn',
      features: [
        {
          id: 'f1',
          title: 'F',
          description: '',
          order: 0,
          demos: [
            { id: 'd1', documentId: 'doc-a', order: 0 },
            { id: 'd2', documentId: 'doc-a', order: 1 },
          ],
        },
      ],
      createdAt: 1,
      updatedAt: 20,
    };
    await db.saveProductTour(tour);
    await expect(db.getProductTour('tour-1')).resolves.toMatchObject({ id: 'tour-1' });
    const summaries = await db.listProductTourSummaries();
    expect(summaries[0]).toMatchObject({ id: 'tour-1', estimatedMinutes: 3 });
    expect(db.collectProductTourDocumentIds(tour)).toEqual(['doc-a']);
    await db.deleteProductTour('tour-1');
    await expect(db.getProductTour('tour-1')).resolves.toBeUndefined();
  });

  it('route helpers and clearLocalLibrary', async () => {
    const db = await load();
    const route = {
      id: 'route-1',
      title: 'Route',
      description: '',
      status: 'draft',
      createdAt: 1,
      updatedAt: 2,
      nodes: [],
      edges: [],
    } as unknown as SavedRoute;

    expect(db.toRouteSummary(route)).toMatchObject({ id: 'route-1', title: 'Route' });
    await db.saveRoute(route);
    // After migration ensureProductTourMigration, routes are converted and removed.
    await expect(db.listRouteSummaries()).resolves.toEqual([]);
    await expect(db.getRoute('route-1')).resolves.toBeUndefined();

    await db.saveFlowDocument(makeDoc('keep-doc'));
    await db.savePersona({
      id: 'extra',
      name: 'X',
      occupation: 'O',
      shortBio: 'b',
      gender: 'neutral',
      avatarId: 'neutral',
      createdAt: 1,
      updatedAt: 1,
    } as Persona);
    await db.saveProductTour({
      id: 'tour-x',
      title: 'T',
      description: '',
      status: 'draft',
      personaId: DEFAULT_PERSONA_ID,
      tourGoal: '',
      features: [],
      createdAt: 1,
      updatedAt: 1,
    });

    await db.clearLocalLibrary();
    await expect(db.getFlowDocument('keep-doc')).resolves.toBeUndefined();
    await expect(db.getProductTour('tour-x')).resolves.toBeUndefined();
    await expect(db.getPersona(DEFAULT_PERSONA_ID)).resolves.toBeTruthy();
    await expect(db.getPersona('extra')).resolves.toBeUndefined();
  });

  it('deleteRoute removes route rows', async () => {
    const db = await load();
    await db.saveRoute({
      id: 'r2',
      title: 'R',
      description: '',
      status: 'draft',
      createdAt: 1,
      updatedAt: 1,
      nodes: [],
      edges: [],
    } as unknown as SavedRoute);
    await db.deleteRoute('r2');
    expect(stores.routes.has('r2')).toBe(false);
  });
});
