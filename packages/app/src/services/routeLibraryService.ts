import {
  deleteRoute,
  getRoute as getRouteFromDb,
  listRouteSummaries,
  saveRoute,
} from '@/storage/flowLibraryDb';
import { createEmptyRoute } from '@/utils/createRoute';
import type { SavedRoute } from '@/types/route';

export async function createAndSaveRoute(): Promise<SavedRoute> {
  const route = createEmptyRoute();
  await saveRoute(route);
  return route;
}

export async function persistRoute(route: SavedRoute): Promise<void> {
  await saveRoute({ ...route, updatedAt: Date.now() });
}

export async function getRoute(id: string): Promise<SavedRoute | undefined> {
  const route = await getRouteFromDb(id);
  if (!route) return undefined;
  return route;
}

export { deleteRoute, listRouteSummaries, saveRoute };
