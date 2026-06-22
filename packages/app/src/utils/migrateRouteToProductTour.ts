import { createId } from '@peacock/shared';
import { DEFAULT_PERSONA_ID } from '@/constants/personaAvatars';
import type { ProductTour, TourFeature } from '@/types/productTour';
import type { SavedRoute } from '@/types/route';
import { getChapterNodesInPathOrder } from '@/utils/routeGraph';

export function convertRouteToProductTour(route: SavedRoute): ProductTour {
  const chapters = getChapterNodesInPathOrder(route);
  const features: TourFeature[] = chapters.map((chapter, index) => ({
    id: chapter.id,
    title: chapter.title,
    description: chapter.description,
    order: index,
    demos: chapter.peacocks
      .slice()
      .sort((a, b) => a.order - b.order)
      .map((peacock, demoIndex) => ({
        id: peacock.id,
        documentId: peacock.documentId,
        order: demoIndex,
        label: peacock.label,
      })),
  }));

  if (!features.length) {
    features.push({
      id: createId(),
      title: 'Feature 1',
      description: '',
      order: 0,
      demos: [],
    });
  }

  return {
    id: route.id,
    title: route.title,
    description: route.description,
    status: route.status,
    personaId: DEFAULT_PERSONA_ID,
    tourGoal: '',
    features,
    migratedFromRoute: true,
    createdAt: route.createdAt,
    updatedAt: route.updatedAt,
  };
}

export async function migrateAllRoutesToProductTours(
  getAllRoutes: () => Promise<SavedRoute[]>,
  getTour: (id: string) => Promise<ProductTour | undefined>,
  saveTour: (tour: ProductTour) => Promise<void>,
  deleteRoute: (id: string) => Promise<void>,
): Promise<number> {
  const routes = await getAllRoutes();
  let migrated = 0;

  for (const route of routes) {
    const existing = await getTour(route.id);
    if (existing) {
      await deleteRoute(route.id);
      continue;
    }

    await saveTour(convertRouteToProductTour(route));
    await deleteRoute(route.id);
    migrated += 1;
  }

  return migrated;
}
