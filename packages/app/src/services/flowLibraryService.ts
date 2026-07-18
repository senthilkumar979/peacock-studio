import {
  deleteFlowDocument,
  getFlowDocument,
  listFlowSummaries,
  saveFlowDocument,
} from '@/storage/libraryRouter';
import { buildSavedFlowDocument, createNewDocumentId } from '@/utils/flowDocumentSnapshot';
import { useFlowStore } from '@/store/flowStore';
import type { SavedFlowDocument } from '@/types/savedFlow';

function getSnapshotSource() {
  const state = useFlowStore.getState();
  return {
    flow: state.flow,
    steps: state.steps,
    screenshotUrls: state.screenshotUrls,
    shareSettings: state.shareSettings,
  };
}

export async function persistCurrentFlow(documentId: string): Promise<void> {
  const existing = await getFlowDocument(documentId);
  const doc = buildSavedFlowDocument(getSnapshotSource(), documentId, existing);
  if (!doc) return;
  await saveFlowDocument(doc);
}

export async function saveNewFlowFromStore(): Promise<string | null> {
  const state = useFlowStore.getState();
  if (!state.flow || !state.steps.some((item) => 'event' in item)) return null;

  const documentId = createNewDocumentId();
  useFlowStore.getState().setDocumentId(documentId);

  const doc = buildSavedFlowDocument(getSnapshotSource(), documentId);
  if (!doc) return null;

  await saveFlowDocument(doc);
  return documentId;
}

export function loadFlowIntoStore(doc: SavedFlowDocument): void {
  useFlowStore.getState().hydrateFromDocument(doc);
}

export async function removeFlowDocument(id: string): Promise<void> {
  await deleteFlowDocument(id);
}

export { getFlowDocument, listFlowSummaries };
