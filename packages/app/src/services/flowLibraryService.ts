import {
  deleteFlowDocument,
  getFlowDocument,
  listFlowSummaries,
  saveFlowDocument,
} from '@/storage/flowLibraryDb';
import { buildSavedFlowDocument, createNewDocumentId } from '@/utils/flowDocumentSnapshot';
import { useFlowStore } from '@/store/flowStore';
import type { SavedFlowDocument } from '@/types/savedFlow';

export async function persistCurrentFlow(documentId: string): Promise<void> {
  const state = useFlowStore.getState();
  const existing = await getFlowDocument(documentId);
  const doc = buildSavedFlowDocument(state, documentId, existing);
  if (!doc) return;
  await saveFlowDocument(doc);
}

export async function saveNewFlowFromStore(): Promise<string | null> {
  const state = useFlowStore.getState();
  if (!state.flow || !state.steps.length) return null;

  const documentId = createNewDocumentId();
  const doc = buildSavedFlowDocument(state, documentId);
  if (!doc) return null;

  await saveFlowDocument(doc);
  useFlowStore.getState().setDocumentId(documentId);
  return documentId;
}

export function loadFlowIntoStore(doc: SavedFlowDocument): void {
  useFlowStore.getState().hydrateFromDocument(doc);
}

export async function removeFlowDocument(id: string): Promise<void> {
  await deleteFlowDocument(id);
}

export { getFlowDocument, listFlowSummaries };
