import type { SavedRoute } from '@/types/route';
import { migrateSavedRoute } from '@/utils/routeGraph';

const MAX_UNDO_STACK = 50;

export function cloneSavedRoute(route: SavedRoute): SavedRoute {
  return JSON.parse(JSON.stringify(route)) as SavedRoute;
}

export function recordRouteHistory(state: {
  route: SavedRoute | null;
  past: SavedRoute[];
  future: SavedRoute[];
}): void {
  if (!state.route) return;
  state.past.push(cloneSavedRoute(state.route));
  if (state.past.length > MAX_UNDO_STACK) {
    state.past.shift();
  }
  state.future = [];
}

export function normalizeHydratedRoute(route: SavedRoute): SavedRoute {
  return migrateSavedRoute(route);
}
