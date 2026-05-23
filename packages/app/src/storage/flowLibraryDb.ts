import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { SavedFlowDocument, SavedFlowSummary } from '@/types/savedFlow';

interface FlowLibrarySchema extends DBSchema {
  documents: {
    key: string;
    value: SavedFlowDocument;
    indexes: { 'by-updated': number };
  };
}

const DB_NAME = 'peacock-flow-library';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<FlowLibrarySchema>> | null = null;

function getDb(): Promise<IDBPDatabase<FlowLibrarySchema>> {
  if (!dbPromise) {
    dbPromise = openDB<FlowLibrarySchema>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        const store = db.createObjectStore('documents', { keyPath: 'id' });
        store.createIndex('by-updated', 'updatedAt');
      },
    });
  }
  return dbPromise;
}

export function toFlowSummary(doc: SavedFlowDocument): SavedFlowSummary {
  return {
    id: doc.id,
    title: doc.flow.flow.title.trim() || 'Untitled flow',
    description: doc.flow.flow.description.trim(),
    generatedAt: doc.flow.metadata.createdAt,
    updatedAt: doc.updatedAt,
    stepCount: doc.steps.length,
  };
}

export async function listFlowSummaries(): Promise<SavedFlowSummary[]> {
  const db = await getDb();
  const docs = await db.getAllFromIndex('documents', 'by-updated');
  return docs.reverse().map(toFlowSummary);
}

export async function getFlowDocument(id: string): Promise<SavedFlowDocument | undefined> {
  const db = await getDb();
  return db.get('documents', id);
}

export async function saveFlowDocument(doc: SavedFlowDocument): Promise<void> {
  const db = await getDb();
  await db.put('documents', doc);
}

export async function deleteFlowDocument(id: string): Promise<void> {
  const db = await getDb();
  await db.delete('documents', id);
}
