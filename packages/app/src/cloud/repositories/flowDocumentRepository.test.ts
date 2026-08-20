import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { FlowPayload, FlowStep } from '@peacock/shared';
import type { SavedFlowDocument } from '@/types/savedFlow';

const auth = { organizationId: 'org-1' };
const fromMock = vi.fn();
const requireCapability = vi.fn();
const requireUserEmail = vi.fn(() => 'user@example.com');
const stampAuditForCloudWrite = vi.fn(() => ({
  createdAt: 1000,
  updatedAt: 2000,
  createdBy: 'user@example.com',
  updatedBy: 'user@example.com',
}));
const resolveScreenshotUrls = vi.fn(async () => ({ shot: 'https://signed' }));
const syncDocumentScreenshots = vi.fn(async () => undefined);
const pruneDocumentScreenshots = vi.fn(async () => undefined);
const deleteDocumentScreenshots = vi.fn(async () => undefined);
const fetchDocumentResources = vi.fn(async () => []);
const syncDocumentResources = vi.fn(async () => undefined);
const deleteResourcesForDocument = vi.fn(async () => undefined);

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
    requireUserEmail: () => requireUserEmail(),
    stampAuditForCloudWrite: (...args: any[]) => (stampAuditForCloudWrite as any)(...args),
  };
});

vi.mock('@/cloud/screenshotStorage', () => ({
  resolveScreenshotUrls: (...args: any[]) => (resolveScreenshotUrls as any)(...args),
  syncDocumentScreenshots: (...args: any[]) => (syncDocumentScreenshots as any)(...args),
  pruneDocumentScreenshots: (...args: any[]) => (pruneDocumentScreenshots as any)(...args),
  deleteDocumentScreenshots: (...args: any[]) => (deleteDocumentScreenshots as any)(...args),
}));

vi.mock('@/cloud/repositories/stepResourceRepository', () => ({
  fetchDocumentResources: (...args: any[]) => (fetchDocumentResources as any)(...args),
  syncDocumentResources: (...args: any[]) => (syncDocumentResources as any)(...args),
  deleteResourcesForDocument: (...args: any[]) => (deleteResourcesForDocument as any)(...args),
}));

import {
  cloudDeleteFlowDocument,
  cloudFindTitleVersionConflict,
  cloudGetFlowDocument,
  cloudListFlowSummaries,
  cloudSaveFlowDocument,
  cloudUpdateFlowDocumentStatus,
} from './flowDocumentRepository';

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

function makeFlow(title = 'Title', version = '1.0.0'): FlowPayload {
  return {
    flow: { title, description: 'd', version, category: 'general', tags: [] },
    metadata: {
      createdAt: 1,
      browser: 't',
      platform: 't',
      screen: { width: 1, height: 1 },
    },
    steps: [],
  };
}

const step: FlowStep = {
  id: 's1',
  title: 's1',
  notes: '',
  generatedTitle: 's1',
  generatedDescription: '',
  screenshotId: 'shot',
  event: {
    id: 'e1',
    type: 'page-view',
    timestamp: 1,
    url: 'https://example.com',
    title: 'Page',
    viewport: { width: 1, height: 1, scrollX: 0, scrollY: 0, dpr: 1 },
    screenshotId: 'shot',
  },
};

describe('flowDocumentRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('cloudListFlowSummaries maps rows', async () => {
    fromMock.mockReturnValue(
      chain({
        data: [
          {
            id: 'd1',
            saved_at: '2024-01-01T00:00:00.000Z',
            updated_at: '2024-01-02T00:00:00.000Z',
            status: 'live',
            flow: makeFlow(),
            steps: [step],
          },
        ],
        error: null,
      }),
    );
    const summaries = await cloudListFlowSummaries();
    expect(summaries[0]).toMatchObject({ id: 'd1', title: 'Title', stepCount: 1 });
  });

  it('cloudGetFlowDocument returns undefined or hydrated doc', async () => {
    fromMock.mockReturnValue(chain({ data: null, error: null }));
    await expect(cloudGetFlowDocument('missing')).resolves.toBeUndefined();

    fromMock.mockReturnValue(
      chain({
        data: {
          id: 'd1',
          saved_at: 1000,
          updated_at: 2000,
          status: 'draft',
          flow: makeFlow('  '),
          steps: [],
          share_settings: null,
        },
        error: null,
      }),
    );
    const doc = await cloudGetFlowDocument('d1');
    expect(doc?.flow.flow.title).toBe('Untitled flow');
    expect(doc?.screenshotUrls).toEqual({ shot: 'https://signed' });
  });

  it('cloudFindTitleVersionConflict finds and excludes ids', async () => {
    fromMock.mockReturnValue(
      chain({
        data: [
          { id: 'other', flow: makeFlow('Same', '1.0.0') },
          { id: 'self', flow: makeFlow('Same', '1.0.0') },
        ],
        error: null,
      }),
    );
    await expect(
      cloudFindTitleVersionConflict({
        title: 'Same',
        version: '1.0.0',
        excludeDocumentId: 'self',
      }),
    ).resolves.toMatchObject({ id: 'other' });

    await expect(
      cloudFindTitleVersionConflict({
        title: 'Missing',
        version: '9.9.9',
      }),
    ).resolves.toBeNull();
  });

  it('cloudSaveFlowDocument upserts and syncs assets', async () => {
    fromMock
      .mockReturnValueOnce(chain({ data: null, error: null })) // existing check
      .mockReturnValueOnce(chain({ data: [], error: null })) // conflict scan
      .mockReturnValueOnce(chain({ data: null, error: null })); // upsert

    const doc: SavedFlowDocument = {
      id: 'd1',
      savedAt: 1,
      updatedAt: 2,
      status: 'draft',
      flow: makeFlow(),
      steps: [step],
      screenshotUrls: { shot: 'data:image/png;base64,YQ==' },
      stepResources: [],
    };

    await cloudSaveFlowDocument(doc);
    expect(requireCapability).toHaveBeenCalledWith('create');
    expect(syncDocumentScreenshots).toHaveBeenCalled();
    expect(pruneDocumentScreenshots).toHaveBeenCalled();
    expect(syncDocumentResources).toHaveBeenCalled();
  });

  it('cloudUpdateFlowDocumentStatus upserts existing row', async () => {
    fromMock
      .mockReturnValueOnce(
        chain({
          data: {
            id: 'd1',
            saved_at: '2024-01-01T00:00:00.000Z',
            updated_at: '2024-01-02T00:00:00.000Z',
            created_at: '2024-01-01T00:00:00.000Z',
            created_by: 'a@b.com',
            flow: makeFlow(),
            steps: [],
            domain_counts: {},
            share_settings: null,
          },
          error: null,
        }),
      )
      .mockReturnValueOnce(chain({ data: { id: 'd1' }, error: null }));

    await cloudUpdateFlowDocumentStatus('d1', 'live');
    expect(requireCapability).toHaveBeenCalledWith('edit');
  });

  it('cloudDeleteFlowDocument cleans screenshots/resources then deletes', async () => {
    fromMock.mockReturnValue(chain({ data: null, error: null }));
    await cloudDeleteFlowDocument('d1');
    expect(requireCapability).toHaveBeenCalledWith('delete');
    expect(deleteDocumentScreenshots).toHaveBeenCalledWith('d1');
    expect(deleteResourcesForDocument).toHaveBeenCalledWith('d1');
  });

  it('throws on list/get errors', async () => {
    fromMock.mockReturnValue(chain({ data: null, error: { message: 'boom' } }));
    await expect(cloudListFlowSummaries()).rejects.toEqual({ message: 'boom' });
  });
});
