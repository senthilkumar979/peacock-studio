import { beforeEach, describe, expect, it, vi } from 'vitest';

const localListFlowSummaries = vi.fn();
const localListPersonas = vi.fn();
const localListProductTourSummaries = vi.fn();
const localGetFlowDocument = vi.fn();
const localGetProductTour = vi.fn();
const listFlowSummaries = vi.fn();
const listProductTourSummaries = vi.fn();
const saveFlowDocument = vi.fn();
const savePersona = vi.fn();
const saveProductTour = vi.fn();
const cloudPersonaIdExistsGlobally = vi.fn();

vi.mock('@/storage/flowLibraryDb', () => ({
  listFlowSummaries: (...args: any[]) => (localListFlowSummaries as any)(...args),
  listPersonas: (...args: any[]) => (localListPersonas as any)(...args),
  listProductTourSummaries: (...args: any[]) => (localListProductTourSummaries as any)(...args),
  getFlowDocument: (...args: any[]) => (localGetFlowDocument as any)(...args),
  getProductTour: (...args: any[]) => (localGetProductTour as any)(...args),
}));

vi.mock('@/storage/libraryRouter', () => ({
  listFlowSummaries: (...args: any[]) => (listFlowSummaries as any)(...args),
  listProductTourSummaries: (...args: any[]) => (listProductTourSummaries as any)(...args),
  saveFlowDocument: (...args: any[]) => (saveFlowDocument as any)(...args),
  savePersona: (...args: any[]) => (savePersona as any)(...args),
  saveProductTour: (...args: any[]) => (saveProductTour as any)(...args),
}));

vi.mock('@/cloud/repositories/personaRepository', () => ({
  cloudPersonaIdExistsGlobally: (...args: any[]) => (cloudPersonaIdExistsGlobally as any)(...args),
}));

vi.mock('@peacock/shared', async () => {
  const actual = await vi.importActual<typeof import('@peacock/shared')>('@peacock/shared');
  return { ...actual, createId: () => 'remapped-id' };
});

import {
  LOCAL_IMPORT_STORAGE_KEY,
  cloudLibraryIsEmpty,
  countLocalLibraryItems,
  dismissLocalImportPrompt,
  hasCompletedLocalImport,
  importLocalLibraryToCloud,
  listLocalIdsMissingFromCloud,
  localLibraryNeedsCloudImport,
  markLocalImportComplete,
} from './importLocalLibrary';

describe('importLocalLibrary', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    localListFlowSummaries.mockResolvedValue([{ id: 'doc-1' }]);
    localListPersonas.mockResolvedValue([{ id: 'p1', name: 'P' }]);
    localListProductTourSummaries.mockResolvedValue([{ id: 'tour-1' }]);
    listFlowSummaries.mockResolvedValue([]);
    listProductTourSummaries.mockResolvedValue([]);
    cloudPersonaIdExistsGlobally.mockResolvedValue(false);
    savePersona.mockResolvedValue(undefined);
    saveFlowDocument.mockResolvedValue(undefined);
    saveProductTour.mockResolvedValue(undefined);
    localGetFlowDocument.mockResolvedValue({ id: 'doc-1' });
    localGetProductTour.mockResolvedValue({ id: 'tour-1', personaId: 'p1' });
  });

  it('counts local items and detects empty cloud', async () => {
    await expect(countLocalLibraryItems()).resolves.toEqual({
      documents: 1,
      personas: 1,
      tours: 1,
    });
    await expect(cloudLibraryIsEmpty()).resolves.toBe(true);
    listFlowSummaries.mockResolvedValue([{ id: 'x' }]);
    await expect(cloudLibraryIsEmpty()).resolves.toBe(false);
  });

  it('lists missing ids and needsImport', async () => {
    listFlowSummaries.mockResolvedValue([{ id: 'doc-1' }]);
    listProductTourSummaries.mockResolvedValue([]);
    await expect(listLocalIdsMissingFromCloud()).resolves.toEqual({
      documentIds: [],
      tourIds: ['tour-1'],
    });
    await expect(localLibraryNeedsCloudImport()).resolves.toBe(true);

    localListFlowSummaries.mockResolvedValue([]);
    localListProductTourSummaries.mockResolvedValue([]);
    await expect(localLibraryNeedsCloudImport()).resolves.toBe(false);
  });

  it('imports remapping taken persona ids and marks complete', async () => {
    cloudPersonaIdExistsGlobally.mockResolvedValue(true);
    localGetProductTour.mockResolvedValue({ id: 'tour-1', personaId: 'p1' });

    const counts = await importLocalLibraryToCloud();
    expect(counts).toEqual({ documents: 1, personas: 1, tours: 1 });
    expect(savePersona).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'remapped-id' }),
      { preserveUpdatedAt: true },
    );
    expect(saveProductTour).toHaveBeenCalledWith(
      expect.objectContaining({ personaId: 'remapped-id' }),
      { preserveUpdatedAt: true },
    );
    expect(hasCompletedLocalImport()).toBe(true);
  });

  it('local import markers', () => {
    expect(hasCompletedLocalImport()).toBe(false);
    markLocalImportComplete();
    expect(hasCompletedLocalImport()).toBe(true);
    dismissLocalImportPrompt();
    expect(localStorage.getItem(LOCAL_IMPORT_STORAGE_KEY)).toBe('dismissed');
    expect(hasCompletedLocalImport()).toBe(false);
  });
});
