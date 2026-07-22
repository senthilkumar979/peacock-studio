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

  for (const persona of localPersonas) {
    await savePersona(persona, { preserveUpdatedAt: true });
  }

  for (const summary of localDocs) {
    const doc = await localGetFlowDocument(summary.id);
    if (doc) await saveFlowDocument(doc, { preserveUpdatedAt: true });
  }

  for (const summary of localTourSummaries) {
    const tour = await localGetProductTour(summary.id);
    if (tour) await saveProductTour(tour, { preserveUpdatedAt: true });
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
