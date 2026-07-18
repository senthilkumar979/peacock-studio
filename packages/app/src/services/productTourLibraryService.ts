import {
  deletePersona,
  deleteProductTour,
  getPersona,
  getProductTour,
  listPersonas,
  listProductTourSummaries,
  savePersona,
  saveProductTour,
} from '@/storage/libraryRouter';
import { createEmptyProductTour, createPersonaFromInput } from '@/utils/createProductTour';
import type { Persona, PersonaInput } from '@/types/persona';
import type { ProductTour } from '@/types/productTour';

export async function createAndSaveProductTour(): Promise<ProductTour> {
  const tour = createEmptyProductTour();
  await saveProductTour(tour);
  return tour;
}

let activeTourCreation: Promise<ProductTour> | null = null;

/** Prevents duplicate draft tours when /tours/new mounts more than once (e.g. Strict Mode). */
export function createAndSaveProductTourOnce(): Promise<ProductTour> {
  if (!activeTourCreation) {
    activeTourCreation = createAndSaveProductTour().finally(() => {
      activeTourCreation = null;
    });
  }

  return activeTourCreation;
}

export async function persistProductTour(tour: ProductTour): Promise<void> {
  await saveProductTour(tour);
}

export async function createAndSavePersona(input: PersonaInput): Promise<Persona> {
  const persona = createPersonaFromInput(input);
  await savePersona(persona);
  return persona;
}

export {
  deletePersona,
  deleteProductTour,
  getPersona,
  getProductTour,
  listPersonas,
  listProductTourSummaries,
  savePersona,
};
