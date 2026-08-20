import { beforeEach, describe, expect, it, vi } from 'vitest';

const saveRoute = vi.fn(async () => undefined);
const getRouteFromDb = vi.fn();
const deleteRoute = vi.fn();
const listRouteSummaries = vi.fn();

vi.mock('@/storage/flowLibraryDb', () => ({
  saveRoute: (...args: any[]) => (saveRoute as any)(...args),
  getRoute: (...args: any[]) => (getRouteFromDb as any)(...args),
  deleteRoute: (...args: any[]) => (deleteRoute as any)(...args),
  listRouteSummaries: (...args: any[]) => (listRouteSummaries as any)(...args),
}));

vi.mock('@/utils/createRoute', () => ({
  createEmptyRoute: () => ({ id: 'route-1', title: 'Untitled', updatedAt: 1 }),
}));

import { createAndSaveRoute, getRoute, persistRoute } from './routeLibraryService';

describe('routeLibraryService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(Date, 'now').mockReturnValue(123);
  });

  it('createAndSaveRoute persists empty route', async () => {
    const route = await createAndSaveRoute();
    expect(route.id).toBe('route-1');
    expect(saveRoute).toHaveBeenCalledWith(route);
  });

  it('persistRoute bumps updatedAt', async () => {
    await persistRoute({ id: 'r', title: 'T', updatedAt: 1 } as never);
    expect(saveRoute).toHaveBeenCalledWith(expect.objectContaining({ updatedAt: 123 }));
  });

  it('getRoute returns undefined when missing', async () => {
    getRouteFromDb.mockResolvedValue(undefined);
    await expect(getRoute('x')).resolves.toBeUndefined();
    getRouteFromDb.mockResolvedValue({ id: 'r' });
    await expect(getRoute('r')).resolves.toEqual({ id: 'r' });
  });
});
