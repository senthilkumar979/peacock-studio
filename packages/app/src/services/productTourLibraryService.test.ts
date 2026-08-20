import { beforeEach, describe, expect, it, vi } from 'vitest';

const saveProductTour = vi.fn(async () => undefined);
const savePersona = vi.fn(async () => undefined);
const deletePersona = vi.fn();
const deleteProductTour = vi.fn();
const getPersona = vi.fn();
const getProductTour = vi.fn();
const listPersonas = vi.fn();
const listProductTourSummaries = vi.fn();

vi.mock('@/storage/libraryRouter', () => ({
  saveProductTour: (...args: any[]) => (saveProductTour as any)(...args),
  savePersona: (...args: any[]) => (savePersona as any)(...args),
  deletePersona: (...args: any[]) => (deletePersona as any)(...args),
  deleteProductTour: (...args: any[]) => (deleteProductTour as any)(...args),
  getPersona: (...args: any[]) => (getPersona as any)(...args),
  getProductTour: (...args: any[]) => (getProductTour as any)(...args),
  listPersonas: (...args: any[]) => (listPersonas as any)(...args),
  listProductTourSummaries: (...args: any[]) => (listProductTourSummaries as any)(...args),
}));

vi.mock('@/utils/createProductTour', () => ({
  createEmptyProductTour: () => ({ id: 'tour-1', title: 'Untitled' }),
  createPersonaFromInput: (input: { name: string }) => ({
    id: 'p-1',
    name: input.name,
  }),
}));

import {
  createAndSavePersona,
  createAndSaveProductTour,
  createAndSaveProductTourOnce,
  persistProductTour,
} from './productTourLibraryService';

describe('productTourLibraryService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('createAndSaveProductTour persists tour', async () => {
    const tour = await createAndSaveProductTour();
    expect(tour.id).toBe('tour-1');
    expect(saveProductTour).toHaveBeenCalledWith(tour);
  });

  it('createAndSaveProductTourOnce dedupes concurrent calls', async () => {
    let resolveSave: () => void = () => undefined;
    saveProductTour.mockImplementationOnce(
      () =>
        new Promise<undefined>((resolve) => {
          resolveSave = () => resolve(undefined);
        }),
    );

    const first = createAndSaveProductTourOnce();
    const second = createAndSaveProductTourOnce();
    expect(first).toBe(second);
    resolveSave();
    await first;
    expect(saveProductTour).toHaveBeenCalledTimes(1);

    await createAndSaveProductTourOnce();
    expect(saveProductTour).toHaveBeenCalledTimes(2);
  });

  it('persistProductTour and createAndSavePersona', async () => {
    await persistProductTour({ id: 't' } as never);
    expect(saveProductTour).toHaveBeenCalledWith({ id: 't' });

    const persona = await createAndSavePersona({
      name: 'Pat',
      occupation: 'Dev',
      shortBio: 'bio',
      gender: 'unspecified',
      avatarId: 'a',
    } as never);
    expect(persona).toEqual({ id: 'p-1', name: 'Pat' });
    expect(savePersona).toHaveBeenCalled();
  });
});
