import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { SavedRoute, SavedRouteSummary } from '@/types/route';
import { countRouteBranches, countRoutePeacocks, getChapterNodes, migrateSavedRoute, needsRouteMigration } from '@/utils/routeGraph';
import type { SavedFlowDocument, SavedFlowSummary } from '@/types/savedFlow';

interface FlowLibrarySchema extends DBSchema {
  documents: {
    key: string;
    value: SavedFlowDocument;
    indexes: { 'by-updated': number };
  };
  routes: {
    key: string;
    value: SavedRoute;
    indexes: { 'by-updated': number };
  };
}

const DB_NAME = 'peacock-flow-library';
const DB_VERSION = 3;

let dbPromise: Promise<IDBPDatabase<FlowLibrarySchema>> | null = null;

function getDb(): Promise<IDBPDatabase<FlowLibrarySchema>> {
  if (!dbPromise) {
    dbPromise = openDB<FlowLibrarySchema>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('documents')) {
          const documents = db.createObjectStore('documents', { keyPath: 'id' });
          documents.createIndex('by-updated', 'updatedAt');
        }

        if (!db.objectStoreNames.contains('routes')) {
          const routes = db.createObjectStore('routes', { keyPath: 'id' });
          routes.createIndex('by-updated', 'updatedAt');
        }
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

export function toRouteSummary(route: SavedRoute): SavedRouteSummary {
  const chapterCount = getChapterNodes(route).length;

  return {
    id: route.id,
    title: route.title.trim() || 'Untitled route',
    description: route.description.trim(),
    status: route.status,
    chapterCount,
    peacockCount: countRoutePeacocks(route),
    branchCount: countRouteBranches(route),
    createdAt: route.createdAt,
    updatedAt: route.updatedAt,
  };
}

export async function listRouteSummaries(): Promise<SavedRouteSummary[]> {
  const db = await getDb();
  const routes = await db.getAllFromIndex('routes', 'by-updated');

  const summaries: SavedRouteSummary[] = [];
  for (const route of routes.reverse()) {
    const migrated = migrateSavedRoute(route);
    if (needsRouteMigration(route)) {
      await db.put('routes', migrated);
    }
    summaries.push(toRouteSummary(migrated));
  }

  return summaries;
}

export async function getRoute(id: string): Promise<SavedRoute | undefined> {
  const db = await getDb();
  const route = await db.get('routes', id);
  if (!route) return undefined;

  const migrated = migrateSavedRoute(route);
  if (needsRouteMigration(route)) {
    await db.put('routes', migrated);
  }
  return migrated;
}

export async function saveRoute(route: SavedRoute): Promise<void> {
  const db = await getDb();
  await db.put('routes', route);
}

export async function deleteRoute(id: string): Promise<void> {
  const db = await getDb();
  await db.delete('routes', id);
}
