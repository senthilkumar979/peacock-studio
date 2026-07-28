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
  listPersonas,
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

export async function cloudLibraryIsEmpty(): Promise<boolean> {
  const [documents, personas, tours] = await Promise.all([
    listFlowSummaries(),
    listPersonas(),
    listProductTourSummaries(),
  ]);

  return documents.length === 0 && personas.length === 0 && tours.length === 0;
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

  localStorage.setItem(LOCAL_IMPORT_STORAGE_KEY, new Date().toISOString());
  return counts;
}

export function hasCompletedLocalImport(): boolean {
  return Boolean(localStorage.getItem(LOCAL_IMPORT_STORAGE_KEY));
}

export function dismissLocalImportPrompt(): void {
  localStorage.setItem(LOCAL_IMPORT_STORAGE_KEY, 'dismissed');
}
