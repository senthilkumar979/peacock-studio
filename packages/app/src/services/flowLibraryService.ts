import {
  deleteFlowDocument,
  getFlowDocument,
  listFlowSummaries,
  saveFlowDocument,
  updateFlowDocumentStatus,
  findTitleVersionConflict,
} from '@/storage/libraryRouter';
import { buildSavedFlowDocument, createNewDocumentId } from '@/utils/flowDocumentSnapshot';
import {
  nextCandidateVersion,
  normalizeFlowTitle,
  normalizeFlowVersion,
  TitleVersionConflictError,
} from '@/utils/flowDocumentMeta';
import { useFlowStore } from '@/store/flowStore';
import type { FlowDocumentStatus, SavedFlowDocument } from '@/types/savedFlow';

export interface PersistFlowOptions {
  /** On title+version clash, bump this doc's version; leave the other doc unchanged. */
  bumpOwnVersionOnConflict?: boolean;
}

function getSnapshotSource() {
  const state = useFlowStore.getState();
  return {
    flow: state.flow,
    steps: state.steps,
    screenshotUrls: state.screenshotUrls,
    shareSettings: state.shareSettings,
    status: state.status,
  };
}

export async function persistCurrentFlow(
  documentId: string,
  options: PersistFlowOptions = {},
): Promise<void> {
  const existing = await getFlowDocument(documentId);
  let doc = buildSavedFlowDocument(getSnapshotSource(), documentId, existing);
  if (!doc) return;

  if (options.bumpOwnVersionOnConflict) {
    doc = await applyUniqueTitleVersion(doc);
  }

  await saveFlowDocument(doc);
}

/** Next free title+version for this doc (other docs untouched). */
export async function suggestUniqueTitleVersion(
  title: string,
  version: string,
  excludeDocumentId?: string,
): Promise<{ title: string; version: string }> {
  return allocateUniqueTitleVersion(title, version, excludeDocumentId);
}

async function applyUniqueTitleVersion(doc: SavedFlowDocument): Promise<SavedFlowDocument> {
  const allocated = await allocateUniqueTitleVersion(
    doc.flow.flow.title,
    doc.flow.flow.version,
    doc.id,
  );
  useFlowStore
    .getState()
    .updateFlowDetails(allocated.title, doc.flow.flow.description, allocated.version);

  return {
    ...doc,
    flow: {
      ...doc.flow,
      flow: {
        ...doc.flow.flow,
        title: allocated.title,
        version: allocated.version,
      },
    },
  };
}

export async function persistDocumentStatus(
  documentId: string,
  status: FlowDocumentStatus,
): Promise<void> {
  await updateFlowDocumentStatus(documentId, status);
}

export async function saveNewFlowFromStore(): Promise<string | null> {
  const state = useFlowStore.getState();
  if (!state.flow || !state.steps.some((item) => 'event' in item)) return null;

  const documentId = createNewDocumentId();
  useFlowStore.getState().setDocumentId(documentId);
  useFlowStore.getState().setDocumentStatus('draft');

  const base = buildSavedFlowDocument(getSnapshotSource(), documentId);
  if (!base) return null;

  const allocated = await allocateUniqueTitleVersion(
    base.flow.flow.title,
    base.flow.flow.version,
    documentId,
  );
  const doc: SavedFlowDocument = {
    ...base,
    flow: {
      ...base.flow,
      flow: {
        ...base.flow.flow,
        title: allocated.title,
        version: allocated.version,
      },
    },
  };
  useFlowStore.getState().updateFlowDetails(allocated.title, doc.flow.flow.description, allocated.version);

  await saveFlowDocument(doc);
  return documentId;
}

export async function duplicateFlowDocument(id: string): Promise<string | null> {
  const source = await getFlowDocument(id);
  if (!source) return null;

  const documentId = createNewDocumentId();
  const now = Date.now();
  const title = `Copy of ${normalizeFlowTitle(source.flow.flow.title)}`;
  const allocated = await allocateUniqueTitleVersion(
    title,
    normalizeFlowVersion(source.flow.flow.version),
    documentId,
  );

  const doc: SavedFlowDocument = {
    id: documentId,
    savedAt: now,
    updatedAt: now,
    status: 'draft',
    flow: {
      ...source.flow,
      flow: {
        ...source.flow.flow,
        title: allocated.title,
        version: allocated.version,
      },
      metadata: {
        ...source.flow.metadata,
        createdAt: now,
      },
    },
    steps: structuredClone(source.steps),
    screenshotUrls: { ...source.screenshotUrls },
    shareSettings: source.shareSettings
      ? structuredClone(source.shareSettings)
      : undefined,
  };

  await saveFlowDocument(doc);
  return documentId;
}

async function allocateUniqueTitleVersion(
  title: string,
  version: string,
  ...excludeDocumentIds: Array<string | undefined>
): Promise<{ title: string; version: string }> {
  const normalizedTitle = normalizeFlowTitle(title);
  let candidateVersion = normalizeFlowVersion(version);
  const excluded = new Set(excludeDocumentIds.filter((id): id is string => Boolean(id)));

  for (let attempt = 0; attempt < 50; attempt += 1) {
    candidateVersion = nextCandidateVersion(version, attempt);
    const conflict = await findTitleVersionConflict({
      title: normalizedTitle,
      version: candidateVersion,
      excludeDocumentIds: [...excluded],
    });
    if (!conflict) {
      return { title: normalizedTitle, version: candidateVersion };
    }
  }

  throw new TitleVersionConflictError({
    conflictDocumentId: [...excluded][0] ?? '',
    title: normalizedTitle,
    version: candidateVersion,
  });
}

export function loadFlowIntoStore(doc: SavedFlowDocument): void {
  useFlowStore.getState().hydrateFromDocument(doc);
}

export async function removeFlowDocument(id: string): Promise<void> {
  await deleteFlowDocument(id);
}

export { getFlowDocument, listFlowSummaries, TitleVersionConflictError };
