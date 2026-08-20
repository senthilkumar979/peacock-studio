import type { StepResource } from '@peacock/shared';
import { createId } from '@peacock/shared';
import { getFlowLibraryDb } from '@/storage/flowLibraryDb';

export async function listResourcesByDocument(documentId: string): Promise<StepResource[]> {
  const db = await getFlowLibraryDb();
  const resources = await db.getAllFromIndex('step_resources', 'by-document', documentId);
  return resources.sort((a, b) => a.sortOrder - b.sortOrder || a.createdAt - b.createdAt);
}

export async function replaceDocumentResources(
  documentId: string,
  resources: StepResource[],
): Promise<void> {
  const db = await getFlowLibraryDb();
  const tx = db.transaction('step_resources', 'readwrite');
  const existing = await tx.store.index('by-document').getAll(documentId);
  await Promise.all(existing.map((resource) => tx.store.delete(resource.id)));
  for (const resource of resources) {
    await tx.store.put({ ...resource, documentId });
  }
  await tx.done;
}

export async function deleteResourcesForStep(
  documentId: string,
  stepId: string,
): Promise<void> {
  const db = await getFlowLibraryDb();
  const resources = await db.getAllFromIndex('step_resources', 'by-step', stepId);
  const toDelete = resources.filter((resource) => resource.documentId === documentId);
  const tx = db.transaction('step_resources', 'readwrite');
  await Promise.all(toDelete.map((resource) => tx.store.delete(resource.id)));
  await tx.done;
}

export async function deleteResourcesForDocument(documentId: string): Promise<void> {
  const db = await getFlowLibraryDb();
  const resources = await db.getAllFromIndex('step_resources', 'by-document', documentId);
  const tx = db.transaction('step_resources', 'readwrite');
  await Promise.all(resources.map((resource) => tx.store.delete(resource.id)));
  await tx.done;
}

export async function copyResources(sourceDocId: string, targetDocId: string): Promise<void> {
  const source = await listResourcesByDocument(sourceDocId);
  const copied = source.map((resource) => ({
    ...resource,
    id: createId(),
    documentId: targetDocId,
    createdAt: Date.now(),
  }));
  await replaceDocumentResources(targetDocId, copied);
}
