import { isCloudLibraryActive } from '@/cloud/authContext';
import { isCloudSyncEnabled } from '@/cloud/config';
import {
  fetchPublicFlowDocument,
  fetchPublicPersona,
  fetchPublicProductTour,
} from '@/cloud/publicShareClient';
import { getPublicShareToken } from '@/cloud/publicShareContext';
import { isGuestSessionSnapshot } from '@/cloud/sessionState';
import {
  cloudDeleteFlowDocument,
  cloudGetFlowDocument,
  cloudListFlowSummaries,
  cloudSaveFlowDocument,
} from '@/cloud/repositories/flowDocumentRepository';
import {
  cloudDeletePersona,
  cloudGetPersona,
  cloudListPersonas,
  cloudSavePersona,
} from '@/cloud/repositories/personaRepository';
import {
  cloudCollectProductTourDocumentIds,
  cloudDeleteProductTour,
  cloudGetProductTour,
  cloudListProductTourSummaries,
  cloudSaveProductTour,
} from '@/cloud/repositories/productTourRepository';
import {
  deleteFlowDocument as localDeleteFlowDocument,
  deletePersona as localDeletePersona,
  deleteProductTour as localDeleteProductTour,
  getFlowDocument as localGetFlowDocument,
  getPersona as localGetPersona,
  getProductTour as localGetProductTour,
  listFlowSummaries as localListFlowSummaries,
  listPersonas as localListPersonas,
  listProductTourSummaries as localListProductTourSummaries,
  saveFlowDocument as localSaveFlowDocument,
  savePersona as localSavePersona,
  saveProductTour as localSaveProductTour,
  collectProductTourDocumentIds as localCollectProductTourDocumentIds,
} from '@/storage/flowLibraryDb';
import { DEFAULT_PERSONA_ID } from '@/constants/personaAvatars';
import type { Persona } from '@/types/persona';
import type { ProductTour, ProductTourSummary } from '@/types/productTour';
import type { SavedFlowDocument, SavedFlowSummary } from '@/types/savedFlow';

function useCloudLibrary(): boolean {
  return isCloudSyncEnabled() && isCloudLibraryActive();
}

export async function listFlowSummaries(): Promise<SavedFlowSummary[]> {
  if (useCloudLibrary()) return cloudListFlowSummaries();
  return localListFlowSummaries();
}

export async function getFlowDocument(id: string): Promise<SavedFlowDocument | undefined> {
  const shareToken = getPublicShareToken();
  if (shareToken && isCloudSyncEnabled()) {
    return fetchPublicFlowDocument(shareToken, id);
  }

  if (useCloudLibrary()) return cloudGetFlowDocument(id);
  return localGetFlowDocument(id);
}

export async function saveFlowDocument(
  doc: SavedFlowDocument,
  options?: { preserveUpdatedAt?: boolean },
): Promise<void> {
  if (useCloudLibrary()) {
    await cloudSaveFlowDocument(doc, options);
    return;
  }
  await localSaveFlowDocument(doc);
}

export async function deleteFlowDocument(id: string): Promise<void> {
  if (isGuestSessionSnapshot()) {
    throw new Error('Sign in to delete documents from your library.');
  }

  if (useCloudLibrary()) {
    await cloudDeleteFlowDocument(id);
    return;
  }
  await localDeleteFlowDocument(id);
}

export async function listPersonas(): Promise<Persona[]> {
  if (useCloudLibrary()) return cloudListPersonas();
  return localListPersonas();
}

export async function getPersona(id: string): Promise<Persona | undefined> {
  const shareToken = getPublicShareToken();
  if (shareToken && isCloudSyncEnabled()) {
    return fetchPublicPersona(shareToken, id);
  }

  if (useCloudLibrary()) return cloudGetPersona(id);
  return localGetPersona(id);
}

export async function savePersona(
  persona: Persona,
  options?: { preserveUpdatedAt?: boolean },
): Promise<void> {
  if (useCloudLibrary()) {
    await cloudSavePersona(persona, options);
    return;
  }
  await localSavePersona(persona);
}

export async function deletePersona(id: string): Promise<void> {
  if (id === DEFAULT_PERSONA_ID) return;

  if (isGuestSessionSnapshot()) {
    throw new Error('Sign in to delete personas from your library.');
  }

  if (useCloudLibrary()) {
    await cloudDeletePersona(id);
    return;
  }
  await localDeletePersona(id);
}

export async function listProductTourSummaries(): Promise<ProductTourSummary[]> {
  if (useCloudLibrary()) return cloudListProductTourSummaries();
  return localListProductTourSummaries();
}

export async function getProductTour(id: string): Promise<ProductTour | undefined> {
  const shareToken = getPublicShareToken();
  if (shareToken && isCloudSyncEnabled()) {
    return fetchPublicProductTour(shareToken);
  }

  if (useCloudLibrary()) return cloudGetProductTour(id);
  return localGetProductTour(id);
}

export async function saveProductTour(
  tour: ProductTour,
  options?: { preserveUpdatedAt?: boolean },
): Promise<void> {
  if (useCloudLibrary()) {
    await cloudSaveProductTour(tour, options);
    return;
  }
  await localSaveProductTour(tour);
}

export async function deleteProductTour(id: string): Promise<void> {
  if (isGuestSessionSnapshot()) {
    throw new Error('Sign in to delete product tours from your library.');
  }

  if (useCloudLibrary()) {
    await cloudDeleteProductTour(id);
    return;
  }
  await localDeleteProductTour(id);
}

export function collectProductTourDocumentIds(tour: ProductTour): string[] {
  if (useCloudLibrary()) return cloudCollectProductTourDocumentIds(tour);
  return localCollectProductTourDocumentIds(tour);
}

export { useCloudLibrary };
