import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { SavedFlowDocument } from '@/types/savedFlow';
import type { ProductTour } from '@/types/productTour';
import type { Persona } from '@/types/persona';
import { DEFAULT_PERSONA_ID } from '@/constants/personaAvatars';

const isCloudSyncEnabled = vi.fn(() => true);
const isCloudLibraryActive = vi.fn(() => true);
const isCloudLibraryFeatureEnabled = vi.fn(() => true);
const isGuestSessionSnapshot = vi.fn(() => false);
const getPublicShareToken = vi.fn(() => null as string | null);

const cloudListFlowSummaries = vi.fn();
const cloudGetFlowDocument = vi.fn();
const cloudSaveFlowDocument = vi.fn();
const cloudFindTitleVersionConflict = vi.fn();
const cloudUpdateFlowDocumentStatus = vi.fn();
const cloudDeleteFlowDocument = vi.fn();
const cloudListPersonas = vi.fn();
const cloudGetPersona = vi.fn();
const cloudSavePersona = vi.fn();
const cloudDeletePersona = vi.fn();
const cloudListProductTourSummaries = vi.fn();
const cloudGetProductTour = vi.fn();
const cloudSaveProductTour = vi.fn();
const cloudDeleteProductTour = vi.fn();
const cloudCollectProductTourDocumentIds = vi.fn(() => ['doc-a']);

const localListFlowSummaries = vi.fn();
const localGetFlowDocument = vi.fn();
const localSaveFlowDocument = vi.fn();
const localDeleteFlowDocument = vi.fn();
const localListPersonas = vi.fn();
const localGetPersona = vi.fn();
const localSavePersona = vi.fn();
const localDeletePersona = vi.fn();
const localListProductTourSummaries = vi.fn();
const localGetProductTour = vi.fn();
const localSaveProductTour = vi.fn();
const localDeleteProductTour = vi.fn();
const localCollectProductTourDocumentIds = vi.fn(() => ['local-doc']);

const fetchPublicFlowDocument = vi.fn();
const fetchPublicPersona = vi.fn();
const fetchPublicProductTour = vi.fn();
const syncDocumentScreenshots = vi.fn();
const isInlineScreenshotUrl = vi.fn(
  (url: string) => url.startsWith('data:') || url.startsWith('blob:'),
);

vi.mock('@/cloud/config', () => ({
  isCloudSyncEnabled: () => isCloudSyncEnabled(),
}));

vi.mock('@/cloud/authContext', () => ({
  isCloudLibraryActive: () => isCloudLibraryActive(),
}));

vi.mock('@/analytics/featureFlags', () => ({
  isCloudLibraryFeatureEnabled: () => isCloudLibraryFeatureEnabled(),
}));

vi.mock('@/cloud/sessionState', () => ({
  isGuestSessionSnapshot: () => isGuestSessionSnapshot(),
}));

vi.mock('@/cloud/publicShareContext', () => ({
  getPublicShareToken: () => getPublicShareToken(),
}));

vi.mock('@/cloud/publicShareClient', () => ({
  fetchPublicFlowDocument: (...args: any[]) => (fetchPublicFlowDocument as any)(...args),
  fetchPublicPersona: (...args: any[]) => (fetchPublicPersona as any)(...args),
  fetchPublicProductTour: (...args: any[]) => (fetchPublicProductTour as any)(...args),
}));

vi.mock('@/cloud/repositories/flowDocumentRepository', () => ({
  cloudListFlowSummaries: (...args: any[]) => (cloudListFlowSummaries as any)(...args),
  cloudGetFlowDocument: (...args: any[]) => (cloudGetFlowDocument as any)(...args),
  cloudSaveFlowDocument: (...args: any[]) => (cloudSaveFlowDocument as any)(...args),
  cloudFindTitleVersionConflict: (...args: any[]) => (cloudFindTitleVersionConflict as any)(...args),
  cloudUpdateFlowDocumentStatus: (...args: any[]) => (cloudUpdateFlowDocumentStatus as any)(...args),
  cloudDeleteFlowDocument: (...args: any[]) => (cloudDeleteFlowDocument as any)(...args),
}));

vi.mock('@/cloud/repositories/personaRepository', () => ({
  cloudListPersonas: (...args: any[]) => (cloudListPersonas as any)(...args),
  cloudGetPersona: (...args: any[]) => (cloudGetPersona as any)(...args),
  cloudSavePersona: (...args: any[]) => (cloudSavePersona as any)(...args),
  cloudDeletePersona: (...args: any[]) => (cloudDeletePersona as any)(...args),
}));

vi.mock('@/cloud/repositories/productTourRepository', () => ({
  cloudListProductTourSummaries: (...args: any[]) => (cloudListProductTourSummaries as any)(...args),
  cloudGetProductTour: (...args: any[]) => (cloudGetProductTour as any)(...args),
  cloudSaveProductTour: (...args: any[]) => (cloudSaveProductTour as any)(...args),
  cloudDeleteProductTour: (...args: any[]) => (cloudDeleteProductTour as any)(...args),
  cloudCollectProductTourDocumentIds: (...args: any[]) =>
    (cloudCollectProductTourDocumentIds as any)(...args),
}));

vi.mock('@/cloud/screenshotStorage', () => ({
  syncDocumentScreenshots: (...args: any[]) => (syncDocumentScreenshots as any)(...args),
}));

vi.mock('@/cloud/screenshotUtils', () => ({
  isInlineScreenshotUrl: (url: string) => isInlineScreenshotUrl(url),
}));

vi.mock('@/storage/flowLibraryDb', () => ({
  listFlowSummaries: (...args: any[]) => (localListFlowSummaries as any)(...args),
  getFlowDocument: (...args: any[]) => (localGetFlowDocument as any)(...args),
  saveFlowDocument: (...args: any[]) => (localSaveFlowDocument as any)(...args),
  deleteFlowDocument: (...args: any[]) => (localDeleteFlowDocument as any)(...args),
  listPersonas: (...args: any[]) => (localListPersonas as any)(...args),
  getPersona: (...args: any[]) => (localGetPersona as any)(...args),
  savePersona: (...args: any[]) => (localSavePersona as any)(...args),
  deletePersona: (...args: any[]) => (localDeletePersona as any)(...args),
  listProductTourSummaries: (...args: any[]) => (localListProductTourSummaries as any)(...args),
  getProductTour: (...args: any[]) => (localGetProductTour as any)(...args),
  saveProductTour: (...args: any[]) => (localSaveProductTour as any)(...args),
  deleteProductTour: (...args: any[]) => (localDeleteProductTour as any)(...args),
  collectProductTourDocumentIds: (...args: any[]) =>
    (localCollectProductTourDocumentIds as any)(...args),
}));

import {
  collectProductTourDocumentIds,
  deleteFlowDocument,
  deletePersona,
  deleteProductTour,
  findTitleVersionConflict,
  getFlowDocument,
  getPersona,
  getProductTour,
  listFlowSummaries,
  listPersonas,
  listProductTourSummaries,
  saveFlowDocument,
  savePersona,
  saveProductTour,
  updateFlowDocumentStatus,
  useCloudLibrary,
} from './libraryRouter';

const doc: SavedFlowDocument = {
  id: 'doc-1',
  savedAt: 1,
  updatedAt: 2,
  status: 'live',
  flow: {
    flow: { title: 'T', description: '', version: '1.0.0', category: 'general', tags: [] },
    metadata: {
      createdAt: 1,
      browser: 't',
      platform: 't',
      screen: { width: 1, height: 1 },
    },
    steps: [],
  },
  steps: [],
  screenshotUrls: {},
};

const tour: ProductTour = {
  id: 'tour-1',
  title: 'Tour',
  description: '',
  status: 'draft',
  personaId: 'p1',
  tourGoal: '',
  features: [],
  createdAt: 1,
  updatedAt: 1,
};

const persona: Persona = {
  id: 'p1',
  name: 'Pat',
  occupation: 'Dev',
  shortBio: 'bio',
  gender: 'neutral',
  avatarId: 'neutral',
  createdAt: 1,
  updatedAt: 1,
};

describe('libraryRouter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    isCloudSyncEnabled.mockReturnValue(true);
    isCloudLibraryActive.mockReturnValue(true);
    isCloudLibraryFeatureEnabled.mockReturnValue(true);
    isGuestSessionSnapshot.mockReturnValue(false);
    getPublicShareToken.mockReturnValue(null);
  });

  it('useCloudLibrary requires sync+active+flag', () => {
    expect(useCloudLibrary()).toBe(true);
    isCloudLibraryFeatureEnabled.mockReturnValue(false);
    expect(useCloudLibrary()).toBe(false);
  });

  it('routes list/save/find through cloud when active', async () => {
    cloudListFlowSummaries.mockResolvedValue([{ id: 'd' }]);
    await expect(listFlowSummaries()).resolves.toEqual([{ id: 'd' }]);

    cloudSaveFlowDocument.mockResolvedValue(undefined);
    await saveFlowDocument(doc);
    expect(cloudSaveFlowDocument).toHaveBeenCalledWith(doc, undefined);

    cloudFindTitleVersionConflict.mockResolvedValue(null);
    await expect(
      findTitleVersionConflict({ title: 'T', version: '1.0.0' }),
    ).resolves.toBeNull();
  });

  it('routes through local when cloud inactive and detects local conflicts', async () => {
    isCloudLibraryActive.mockReturnValue(false);
    localListFlowSummaries.mockResolvedValue([
      { id: 'other', title: 'Same', version: '1.0.0' },
    ]);
    await expect(
      findTitleVersionConflict({ title: 'Same', version: '1.0.0' }),
    ).resolves.toMatchObject({ id: 'other' });

    await expect(
      saveFlowDocument({
        ...doc,
        flow: {
          ...doc.flow,
          flow: { ...doc.flow.flow, title: 'Same', version: '1.0.0' },
        },
      }),
    ).rejects.toThrow(/already exists|conflict/i);
  });

  it('getFlowDocument uses public share token path', async () => {
    getPublicShareToken.mockReturnValue('share');
    fetchPublicFlowDocument.mockResolvedValue(doc);
    await expect(getFlowDocument('doc-1')).resolves.toEqual(doc);
  });

  it('getFlowDocument reconciles missing local inline screenshots', async () => {
    cloudGetFlowDocument.mockResolvedValue({ ...doc, screenshotUrls: {} });
    localGetFlowDocument.mockResolvedValue({
      ...doc,
      screenshotUrls: { shot: 'data:image/png;base64,YQ==' },
    });
    syncDocumentScreenshots.mockResolvedValue(undefined);
    cloudGetFlowDocument.mockResolvedValueOnce({ ...doc, screenshotUrls: {} }).mockResolvedValueOnce({
      ...doc,
      screenshotUrls: { shot: 'https://signed' },
    });

    const result = await getFlowDocument('doc-1');
    expect(syncDocumentScreenshots).toHaveBeenCalled();
    expect(result?.screenshotUrls.shot).toBe('https://signed');
  });

  it('getFlowDocument promotes local when cloud missing', async () => {
    cloudGetFlowDocument.mockResolvedValueOnce(undefined).mockResolvedValueOnce(doc);
    localGetFlowDocument.mockResolvedValue(doc);
    cloudSaveFlowDocument.mockResolvedValue(undefined);

    await expect(getFlowDocument('doc-1')).resolves.toEqual(doc);
    expect(cloudSaveFlowDocument).toHaveBeenCalledWith(doc, { preserveUpdatedAt: true });
    expect(localDeleteFlowDocument).toHaveBeenCalledWith('doc-1');
  });

  it('guest cannot delete; cloud delete otherwise', async () => {
    isGuestSessionSnapshot.mockReturnValue(true);
    await expect(deleteFlowDocument('doc-1')).rejects.toThrow(/Sign in to delete documents/);
    await expect(deletePersona('p1')).rejects.toThrow(/Sign in to delete personas/);
    await expect(deleteProductTour('tour-1')).rejects.toThrow(/Sign in to delete product tours/);

    isGuestSessionSnapshot.mockReturnValue(false);
    cloudDeleteFlowDocument.mockResolvedValue(undefined);
    await deleteFlowDocument('doc-1');
    expect(cloudDeleteFlowDocument).toHaveBeenCalledWith('doc-1');
  });

  it('persona/tour routing and default persona guard', async () => {
    cloudListPersonas.mockResolvedValue([persona]);
    await expect(listPersonas()).resolves.toEqual([persona]);
    cloudGetPersona.mockResolvedValue(persona);
    await expect(getPersona('p1')).resolves.toEqual(persona);
    await savePersona(persona);
    expect(cloudSavePersona).toHaveBeenCalled();
    await deletePersona(DEFAULT_PERSONA_ID);
    expect(cloudDeletePersona).not.toHaveBeenCalled();

    getPublicShareToken.mockReturnValue('tok');
    fetchPublicPersona.mockResolvedValue(persona);
    await expect(getPersona('p1')).resolves.toEqual(persona);

    getPublicShareToken.mockReturnValue(null);
    cloudListProductTourSummaries.mockResolvedValue([{ id: 'tour-1' }]);
    await expect(listProductTourSummaries()).resolves.toEqual([{ id: 'tour-1' }]);

    cloudGetProductTour.mockResolvedValue(tour);
    localGetProductTour.mockResolvedValue(tour);
    await expect(getProductTour('tour-1')).resolves.toEqual(tour);
    expect(localDeleteProductTour).toHaveBeenCalledWith('tour-1');

    cloudGetProductTour.mockResolvedValueOnce(undefined).mockResolvedValueOnce(tour);
    localGetProductTour.mockResolvedValue(tour);
    await expect(getProductTour('tour-1')).resolves.toEqual(tour);
    expect(cloudSaveProductTour).toHaveBeenCalled();

    await saveProductTour(tour);
    expect(cloudSaveProductTour).toHaveBeenCalledWith(tour, undefined);
    await deleteProductTour('tour-1');
    expect(cloudDeleteProductTour).toHaveBeenCalledWith('tour-1');

    expect(collectProductTourDocumentIds(tour)).toEqual(['doc-a']);
  });

  it('updateFlowDocumentStatus local path', async () => {
    isCloudLibraryActive.mockReturnValue(false);
    localGetFlowDocument.mockResolvedValue(doc);
    await updateFlowDocumentStatus('doc-1', 'draft');
    expect(localSaveFlowDocument).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'draft' }),
    );

    localGetFlowDocument.mockResolvedValue(undefined);
    await expect(updateFlowDocumentStatus('missing', 'live')).rejects.toThrow(/not found/);
  });

  it('public tour fetch ignores id when share token set', async () => {
    getPublicShareToken.mockReturnValue('tok');
    fetchPublicProductTour.mockResolvedValue(tour);
    await expect(getProductTour('ignored')).resolves.toEqual(tour);
  });
});
