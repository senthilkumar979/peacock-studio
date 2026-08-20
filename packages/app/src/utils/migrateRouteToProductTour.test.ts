import { describe, expect, it, vi } from 'vitest';
import type { ProductTour } from '@/types/productTour';
import type { SavedRoute } from '@/types/route';
import {
  convertRouteToProductTour,
  migrateAllRoutesToProductTours,
} from './migrateRouteToProductTour';

vi.mock('@/utils/routeGraph', () => ({
  getChapterNodesInPathOrder: (route: SavedRoute) =>
    route.nodes.filter((node) => node.type === 'chapter'),
}));

vi.mock('@peacock/shared', async () => {
  const actual = await vi.importActual<typeof import('@peacock/shared')>('@peacock/shared');
  return {
    ...actual,
    createId: () => 'generated-feature',
  };
});

function route(partial: Partial<SavedRoute> = {}): SavedRoute {
  return {
    id: 'route-1',
    title: 'Legacy route',
    description: 'Desc',
    status: 'live',
    entryNodeId: 'c1',
    nodes: [
      {
        id: 'c1',
        type: 'chapter',
        title: 'Chapter A',
        description: 'A',
        peacocks: [
          { id: 'demo-2', documentId: 'doc-b', order: 2, label: 'Second' },
          { id: 'demo-1', documentId: 'doc-a', order: 1, label: 'First' },
        ],
        position: { x: 0, y: 0 },
      },
    ],
    edges: [],
    createdAt: 10,
    updatedAt: 20,
    ...partial,
  };
}

describe('convertRouteToProductTour', () => {
  it('maps chapters to features and sorts demos by peacock order', () => {
    const tour = convertRouteToProductTour(route());
    expect(tour).toMatchObject({
      id: 'route-1',
      title: 'Legacy route',
      migratedFromRoute: true,
      features: [
        {
          id: 'c1',
          title: 'Chapter A',
          demos: [
            { id: 'demo-1', documentId: 'doc-a', order: 0, label: 'First' },
            { id: 'demo-2', documentId: 'doc-b', order: 1, label: 'Second' },
          ],
        },
      ],
    });
  });

  it('adds a placeholder feature when route has no chapters', () => {
    const tour = convertRouteToProductTour(route({ nodes: [], entryNodeId: '' }));
    expect(tour.features).toEqual([
      {
        id: 'generated-feature',
        title: 'Feature 1',
        description: '',
        order: 0,
        demos: [],
      },
    ]);
  });
});

describe('migrateAllRoutesToProductTours', () => {
  it('skips routes that already have tours and migrates the rest', async () => {
    const saveTour = vi.fn();
    const deleteRoute = vi.fn();
    const count = await migrateAllRoutesToProductTours(
      async () => [route({ id: 'existing' }), route({ id: 'new' })],
      async (id) => (id === 'existing' ? ({ id } as ProductTour) : undefined),
      saveTour,
      deleteRoute,
    );

    expect(count).toBe(1);
    expect(saveTour).toHaveBeenCalledTimes(1);
    expect(deleteRoute).toHaveBeenCalledWith('new');
  });
});
