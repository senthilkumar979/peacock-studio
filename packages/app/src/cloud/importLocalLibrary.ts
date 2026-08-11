import { createId } from '@peacock/shared';
import {
  getFlowDocument as localGetFlowDocument,
  getProductTour as localGetProductTour,
  listFlowSummaries as localListFlowSummaries,
  listPersonas as localListPersonas,
  listProductTourSummaries as localListProductTourSummaries,
} from '@/storage/flowLibraryDb';
import {
  listFlowSummaries,
  listProductTourSummaries,
  saveFlowDocument,
  savePersona,
  saveProductTour,
} from '@/storage/libraryRouter';
import { cloudPersonaIdExistsGlobally } from '@/cloud/repositories/personaRepository';

export interface LocalLibraryImportCounts {
  documents: number;
  personas: number;
  tours: number;
}

export const LOCAL_IMPORT_STORAGE_KEY = 'peacock-local-library-imported';

export async function countLocalLibraryItems(): Promise<LocalLibraryImportCounts> {
  const [documents, personas, tours] = await Promise.all([
    localListFlowSummaries(),
    localListPersonas(),
    localListProductTourSummaries(),
  ]);

  return {
    documents: documents.length,
    personas: personas.length,
    tours: tours.length,
  };
}

/**
 * True when the cloud workspace has no flow docs or product tours.
 * Intentionally ignores personas — `listPersonas()` seeds a default persona and
 * would otherwise make every new org look non-empty (skipping guest import).
 */
export async function cloudLibraryIsEmpty(): Promise<boolean> {
  const [documents, tours] = await Promise.all([
    listFlowSummaries(),
    listProductTourSummaries(),
  ]);

  return documents.length === 0 && tours.length === 0;
}

/** Local flow docs / tours whose ids are not yet present in the cloud library. */
export async function listLocalIdsMissingFromCloud(): Promise<{
  documentIds: string[];
  tourIds: string[];
}> {
  const [localDocs, localTours, cloudDocs, cloudTours] = await Promise.all([
    localListFlowSummaries(),
    localListProductTourSummaries(),
    listFlowSummaries(),
    listProductTourSummaries(),
  ]);

  const cloudDocIds = new Set(cloudDocs.map((doc) => doc.id));
  const cloudTourIds = new Set(cloudTours.map((tour) => tour.id));

  return {
    documentIds: localDocs.filter((doc) => !cloudDocIds.has(doc.id)).map((doc) => doc.id),
    tourIds: localTours.filter((tour) => !cloudTourIds.has(tour.id)).map((tour) => tour.id),
  };
}

export async function localLibraryNeedsCloudImport(): Promise<boolean> {
  const local = await countLocalLibraryItems();
  if (local.documents === 0 && local.tours === 0) return false;

  const missing = await listLocalIdsMissingFromCloud();
  return missing.documentIds.length > 0 || missing.tourIds.length > 0;
}

export async function importLocalLibraryToCloud(): Promise<LocalLibraryImportCounts> {
  const [localDocs, localPersonas, localTourSummaries] = await Promise.all([
    localListFlowSummaries(),
    localListPersonas(),
    localListProductTourSummaries(),
  ]);

  // personas.id is a global PK — remap any id already claimed by another org
  // (common for the guest default persona id).
  const personaIdMap = new Map<string, string>();
  for (const persona of localPersonas) {
    const taken = await cloudPersonaIdExistsGlobally(persona.id);
    const nextId = taken ? createId() : persona.id;
    if (nextId !== persona.id) personaIdMap.set(persona.id, nextId);
    await savePersona(
      nextId === persona.id ? persona : { ...persona, id: nextId },
      { preserveUpdatedAt: true },
    );
  }

  for (const summary of localDocs) {
    const doc = await localGetFlowDocument(summary.id);
    if (doc) await saveFlowDocument(doc, { preserveUpdatedAt: true });
  }

  for (const summary of localTourSummaries) {
    const tour = await localGetProductTour(summary.id);
    if (!tour) continue;
    const mappedPersonaId = personaIdMap.get(tour.personaId) ?? tour.personaId;
    await saveProductTour(
      mappedPersonaId === tour.personaId ? tour : { ...tour, personaId: mappedPersonaId },
      { preserveUpdatedAt: true },
    );
  }

  const counts = {
    documents: localDocs.length,
    personas: localPersonas.length,
    tours: localTourSummaries.length,
  };

  markLocalImportComplete();
  return counts;
}

export function hasCompletedLocalImport(): boolean {
  const value = localStorage.getItem(LOCAL_IMPORT_STORAGE_KEY);
  return Boolean(value) && value !== 'dismissed';
}

export function markLocalImportComplete(): void {
  localStorage.setItem(LOCAL_IMPORT_STORAGE_KEY, new Date().toISOString());
}

export function dismissLocalImportPrompt(): void {
  localStorage.setItem(LOCAL_IMPORT_STORAGE_KEY, 'dismissed');
}
