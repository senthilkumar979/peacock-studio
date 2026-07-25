import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { Persona } from '@/types/persona';
import type { ProductTour, ProductTourSummary } from '@/types/productTour';
import type { SavedRoute, SavedRouteSummary } from '@/types/route';
import type { SavedFlowDocument, SavedFlowSummary } from '@/types/savedFlow';
import { createDefaultPersona, countTourDemos } from '@/utils/createProductTour';
import { convertRouteToProductTour } from '@/utils/migrateRouteToProductTour';
import { estimateTourDurationMinutes } from '@/utils/productTourLearner';
import { countRouteBranches, countRoutePeacocks, getChapterNodes, migrateSavedRoute, needsRouteMigration } from '@/utils/routeGraph';
import { countPlayableSteps } from '@/utils/flowDocumentSnapshot';
import { normalizeFlowStatus, normalizeFlowVersion } from '@/utils/flowDocumentMeta';
import { normalizePersona } from '@/utils/normalizePersona';
import { normalizeProductTour } from '@/utils/normalizeProductTour';
import { DEFAULT_PERSONA_ID } from '@/constants/personaAvatars';
import { sortTourFeatures } from '@/utils/createProductTour';

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
  personas: {
    key: string;
    value: Persona;
    indexes: { 'by-updated': number };
  };
  productTours: {
    key: string;
    value: ProductTour;
    indexes: { 'by-updated': number };
  };
}

const DB_NAME = 'peacock-flow-library';
const DB_VERSION = 5;

let dbPromise: Promise<IDBPDatabase<FlowLibrarySchema>> | null = null;
let migrationPromise: Promise<void> | null = null;
let personaGoalMigrationPromise: Promise<void> | null = null;

function getDb(): Promise<IDBPDatabase<FlowLibrarySchema>> {
  if (!dbPromise) {
    dbPromise = openDB<FlowLibrarySchema>(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion) {
        if (!db.objectStoreNames.contains('documents')) {
          const documents = db.createObjectStore('documents', { keyPath: 'id' });
          documents.createIndex('by-updated', 'updatedAt');
        }

        if (!db.objectStoreNames.contains('routes')) {
          const routes = db.createObjectStore('routes', { keyPath: 'id' });
          routes.createIndex('by-updated', 'updatedAt');
        }

        if (oldVersion < 4) {
          if (!db.objectStoreNames.contains('personas')) {
            const personas = db.createObjectStore('personas', { keyPath: 'id' });
            personas.createIndex('by-updated', 'updatedAt');
          }
          if (!db.objectStoreNames.contains('productTours')) {
            const productTours = db.createObjectStore('productTours', { keyPath: 'id' });
            productTours.createIndex('by-updated', 'updatedAt');
          }
        }
      },
    });
  }
  return dbPromise;
}

async function ensureDefaultPersona(db: IDBPDatabase<FlowLibrarySchema>): Promise<void> {
  const existing = await db.get('personas', DEFAULT_PERSONA_ID);
  if (!existing) {
    await db.put('personas', createDefaultPersona());
    return;
  }

  if (existing.name === 'Product explorer') {
    const sheela = createDefaultPersona();
    await db.put('personas', {
      ...sheela,
      createdAt: existing.createdAt,
      updatedAt: Date.now(),
    });
  }
}

async function ensurePersonaGoalSeparationMigration(
  db: IDBPDatabase<FlowLibrarySchema>,
): Promise<void> {
  if (personaGoalMigrationPromise) {
    await personaGoalMigrationPromise;
    return;
  }

  personaGoalMigrationPromise = (async () => {
    const personas = await db.getAll('personas');
    for (const rawPersona of personas) {
      const legacy = rawPersona as Persona & { goal?: string };
      if ('goal' in legacy) {
        await db.put('personas', normalizePersona(legacy));
      }
    }

    const tours = await db.getAll('productTours');
    for (const rawTour of tours) {
      if (rawTour.tourGoal !== undefined) continue;

      const persona = await db.get('personas', rawTour.personaId);
      const legacyPersona = persona as (Persona & { goal?: string }) | undefined;
      const tourGoal =
        legacyPersona?.goal?.trim() ||
        legacyPersona?.defaultGoal?.trim() ||
        '';

      await db.put(
        'productTours',
        normalizeProductTour({ ...rawTour, tourGoal }),
      );
    }
  })();

  await personaGoalMigrationPromise;
}

async function ensureProductTourMigration(db: IDBPDatabase<FlowLibrarySchema>): Promise<void> {
  if (migrationPromise) {
    await migrationPromise;
    return;
  }

  migrationPromise = (async () => {
    await ensureDefaultPersona(db);
    const routes = await db.getAllFromIndex('routes', 'by-updated');
    for (const route of routes) {
      const migratedRoute = migrateSavedRoute(route);
      const existing = await db.get('productTours', migratedRoute.id);
      if (!existing) {
        await db.put('productTours', convertRouteToProductTour(migratedRoute));
      }
      await db.delete('routes', migratedRoute.id);
    }
  })();

  await migrationPromise;
  await ensurePersonaGoalSeparationMigration(db);
}

export function toFlowSummary(doc: SavedFlowDocument): SavedFlowSummary {
  return {
    id: doc.id,
    title: doc.flow.flow.title.trim() || 'Untitled flow',
    description: doc.flow.flow.description.trim(),
    version: normalizeFlowVersion(doc.flow.flow.version),
    status: normalizeFlowStatus(doc.status, 'live'),
    generatedAt: doc.flow.metadata.createdAt,
    updatedAt: doc.updatedAt,
    createdBy: doc.createdBy ?? null,
    updatedBy: doc.updatedBy ?? null,
    stepCount: countPlayableSteps(doc.steps),
  };
}

export async function listFlowSummaries(): Promise<SavedFlowSummary[]> {
  const db = await getDb();
  const docs = await db.getAllFromIndex('documents', 'by-updated');
  return docs.reverse().map(toFlowSummary);
}

export async function getFlowDocument(id: string): Promise<SavedFlowDocument | undefined> {
  const db = await getDb();
  const doc = await db.get('documents', id);
  if (!doc) return undefined;
  return {
    ...doc,
    status: normalizeFlowStatus(doc.status, 'live'),
    flow: {
      ...doc.flow,
      flow: {
        ...doc.flow.flow,
        version: normalizeFlowVersion(doc.flow.flow.version),
      },
    },
  };
}

export async function saveFlowDocument(doc: SavedFlowDocument): Promise<void> {
  const db = await getDb();
  await db.put('documents', {
    ...doc,
    status: normalizeFlowStatus(doc.status, 'draft'),
    flow: {
      ...doc.flow,
      flow: {
        ...doc.flow.flow,
        version: normalizeFlowVersion(doc.flow.flow.version),
      },
    },
  });
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
  await ensureProductTourMigration(db);
  return [];
}

export async function getRoute(id: string): Promise<SavedRoute | undefined> {
  const db = await getDb();
  await ensureProductTourMigration(db);
  const tour = await db.get('productTours', id);
  if (tour) return undefined;
  const route = await db.get('routes', id);
  if (!route) return undefined;
  const migrated = migrateSavedRoute(route);
  if (needsRouteMigration(route)) await db.put('routes', migrated);
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

export async function listPersonas(): Promise<Persona[]> {
  const db = await getDb();
  await ensureProductTourMigration(db);
  const personas = await db.getAllFromIndex('personas', 'by-updated');
  return personas.reverse().map((persona) => normalizePersona(persona));
}

export async function getPersona(id: string): Promise<Persona | undefined> {
  const db = await getDb();
  await ensureDefaultPersona(db);
  const persona = await db.get('personas', id);
  return persona ? normalizePersona(persona) : undefined;
}

export async function savePersona(persona: Persona): Promise<void> {
  const db = await getDb();
  await db.put('personas', normalizePersona({ ...persona, updatedAt: Date.now() }));
}

export async function deletePersona(id: string): Promise<void> {
  if (id === DEFAULT_PERSONA_ID) return;
  const db = await getDb();
  await db.delete('personas', id);
}

export async function toProductTourSummary(
  tour: ProductTour,
  personaName: string,
): Promise<ProductTourSummary> {
  const estimatedMinutes = await estimateTourDurationMinutes(tour);

  return {
    id: tour.id,
    title: tour.title.trim() || 'Untitled product tour',
    description: tour.description.trim(),
    status: tour.status,
    personaId: tour.personaId,
    personaName,
    tourGoal: tour.tourGoal.trim(),
    featureCount: sortTourFeatures(tour.features).length,
    demoCount: countTourDemos(tour),
    estimatedMinutes,
    createdAt: tour.createdAt,
    updatedAt: tour.updatedAt,
    createdBy: tour.createdBy ?? null,
    updatedBy: tour.updatedBy ?? null,
  };
}

export async function listProductTourSummaries(): Promise<ProductTourSummary[]> {
  const db = await getDb();
  await ensureProductTourMigration(db);
  const tours = await db.getAllFromIndex('productTours', 'by-updated');
  const summaries: ProductTourSummary[] = [];

  for (const tour of tours.reverse()) {
    const normalizedTour = normalizeProductTour(tour);
    const persona = (await db.get('personas', normalizedTour.personaId)) ?? createDefaultPersona();
    summaries.push(await toProductTourSummary(normalizedTour, persona.name));
  }

  return summaries;
}

export async function getProductTour(id: string): Promise<ProductTour | undefined> {
  const db = await getDb();
  await ensureProductTourMigration(db);
  const tour = await db.get('productTours', id);
  return tour ? normalizeProductTour(tour) : undefined;
}

export async function saveProductTour(tour: ProductTour): Promise<void> {
  const db = await getDb();
  await ensureDefaultPersona(db);
  await db.put('productTours', normalizeProductTour({ ...tour, updatedAt: Date.now() }));
}

export async function deleteProductTour(id: string): Promise<void> {
  const db = await getDb();
  await db.delete('productTours', id);
}

export async function clearLocalLibrary(): Promise<void> {
  const db = await getDb();

  const documents = await db.getAll('documents');
  for (const doc of documents) {
    await db.delete('documents', doc.id);
  }

  const tours = await db.getAll('productTours');
  for (const tour of tours) {
    await db.delete('productTours', tour.id);
  }

  const personas = await db.getAll('personas');
  for (const persona of personas) {
    if (persona.id === DEFAULT_PERSONA_ID) continue;
    await db.delete('personas', persona.id);
  }
}

export function collectProductTourDocumentIds(tour: ProductTour): string[] {
  const seen = new Set<string>();
  const ids: string[] = [];

  for (const feature of sortTourFeatures(tour.features)) {
    for (const demo of feature.demos) {
      if (seen.has(demo.documentId)) continue;
      seen.add(demo.documentId);
      ids.push(demo.documentId);
    }
  }

  return ids;
}
