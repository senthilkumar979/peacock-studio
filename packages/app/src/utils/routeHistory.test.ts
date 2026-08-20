import { describe, expect, it, vi } from 'vitest';
import type { SavedRoute } from '@/types/route';
import { cloneSavedRoute, recordRouteHistory } from './routeHistory';

vi.mock('@/utils/routeGraph', () => ({
  migrateSavedRoute: (route: SavedRoute) => route,
}));

function route(id: string): SavedRoute {
  return {
    id,
    title: id,
    description: '',
    status: 'draft',
    entryNodeId: 'n1',
    nodes: [],
    edges: [],
    createdAt: 1,
    updatedAt: 2,
  };
}

describe('cloneSavedRoute', () => {
  it('deep-clones so mutations do not affect the original', () => {
    const original = route('r1');
    const clone = cloneSavedRoute(original);
    clone.title = 'changed';
    expect(original.title).toBe('r1');
  });
});

describe('recordRouteHistory', () => {
  it('no-ops when route is null', () => {
    const state = { route: null, past: [] as SavedRoute[], future: [route('f')] };
    recordRouteHistory(state);
    expect(state.past).toEqual([]);
    expect(state.future).toHaveLength(1);
  });

  it('pushes a clone onto past and clears future', () => {
    const current = route('current');
    const state = {
      route: current,
      past: [] as SavedRoute[],
      future: [route('future')],
    };
    recordRouteHistory(state);
    expect(state.past).toHaveLength(1);
    expect(state.past[0]).not.toBe(current);
    expect(state.past[0]?.id).toBe('current');
    expect(state.future).toEqual([]);
  });

  it('trims past to 50 entries', () => {
    const state = {
      route: route('now'),
      past: Array.from({ length: 50 }, (_, i) => route(`old-${i}`)),
      future: [] as SavedRoute[],
    };
    recordRouteHistory(state);
    expect(state.past).toHaveLength(50);
    expect(state.past[0]?.id).toBe('old-1');
    expect(state.past[49]?.id).toBe('now');
  });
});
