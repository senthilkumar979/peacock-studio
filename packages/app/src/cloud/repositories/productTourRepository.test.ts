import { beforeEach, describe, expect, it, vi } from 'vitest';

const auth = { organizationId: 'org-1' };
const fromMock = vi.fn();
const requireCapability = vi.fn();
const stampAudit = vi.fn(() => ({
  createdAt: 10,
  updatedAt: 20,
  createdBy: 'u@e.com',
  updatedBy: 'u@e.com',
}));

vi.mock('@/cloud/authContext', () => ({
  requireCloudAuthContext: () => auth,
  requireCapability: (...args: any[]) => (requireCapability as any)(...args),
}));

vi.mock('@/cloud/supabaseClient', () => ({
  getAuthenticatedSupabaseClient: () => ({ from: fromMock }),
}));

vi.mock('@/cloud/audit', async () => {
  const actual = await vi.importActual<typeof import('@/cloud/audit')>('@/cloud/audit');
  return {
    ...actual,
    stampAuditForCloudWrite: (...args: any[]) => (stampAudit as any)(...args),
  };
});

vi.mock('@/utils/productTourLearner', () => ({
  estimateTourDurationMinutes: async () => 5,
}));

import {
  cloudCollectProductTourDocumentIds,
  cloudDeleteProductTour,
  cloudGetProductTour,
  cloudListProductTourSummaries,
  cloudSaveProductTour,
} from './productTourRepository';
import type { ProductTour } from '@/types/productTour';

function chain(result: { data?: unknown; error?: unknown }) {
  const api: Record<string, unknown> = {};
  for (const method of [
    'select',
    'eq',
    'order',
    'maybeSingle',
    'upsert',
    'delete',
  ] as const) {
    api[method] = vi.fn(() => api);
  }
  (api as { then?: unknown }).then = (onFulfilled: (value: unknown) => unknown) =>
    Promise.resolve(result).then(onFulfilled);
  return api;
}

const tourRow = {
  id: 't1',
  title: 'Tour',
  description: 'd',
  status: 'draft',
  persona_id: 'p1',
  tour_goal: 'learn',
  features: [
    {
      id: 'f1',
      title: 'F',
      sortOrder: 0,
      demos: [
        { id: 'd1', documentId: 'doc-a', sortOrder: 0 },
        { id: 'd2', documentId: 'doc-a', sortOrder: 1 },
        { id: 'd3', documentId: 'doc-b', sortOrder: 2 },
      ],
    },
  ],
  completion_cta: null,
  migrated_from_route: false,
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-02T00:00:00.000Z',
};

describe('productTourRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('lists summaries with persona names', async () => {
    fromMock
      .mockReturnValueOnce(chain({ data: [tourRow], error: null }))
      .mockReturnValueOnce(chain({ data: [{ id: 'p1', name: 'Pat' }], error: null }));

    const summaries = await cloudListProductTourSummaries();
    expect(summaries[0]).toMatchObject({
      id: 't1',
      personaName: 'Pat',
      demoCount: 3,
      estimatedMinutes: 5,
    });
  });

  it('gets/saves/deletes tours', async () => {
    fromMock.mockReturnValueOnce(chain({ data: null, error: null }));
    await expect(cloudGetProductTour('missing')).resolves.toBeUndefined();

    fromMock
      .mockReturnValueOnce(chain({ data: null, error: null })) // existing check
      .mockReturnValueOnce(chain({ data: null, error: null })); // upsert
    await cloudSaveProductTour(tourRow as unknown as ProductTour);
    expect(requireCapability).toHaveBeenCalledWith('create');

    fromMock.mockReturnValue(chain({ data: null, error: null }));
    await cloudDeleteProductTour('t1');
    expect(requireCapability).toHaveBeenCalledWith('delete');
  });

  it('cloudCollectProductTourDocumentIds dedupes', () => {
    const ids = cloudCollectProductTourDocumentIds({
      id: 't',
      title: 't',
      description: '',
      status: 'draft',
      personaId: 'p',
      tourGoal: '',
      features: tourRow.features as unknown as ProductTour['features'],
      createdAt: 1,
      updatedAt: 1,
    });
    expect(ids).toEqual(['doc-a', 'doc-b']);
  });
});
