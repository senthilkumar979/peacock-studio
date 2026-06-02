import {
  deletePersona,
  deleteProductTour,
  getPersona,
  getProductTour,
  listPersonas,
  listProductTourSummaries,
  savePersona,
  saveProductTour,
} from '@/storage/flowLibraryDb';
import { createEmptyProductTour, createPersonaFromInput } from '@/utils/createProductTour';
import type { Persona, PersonaInput } from '@/types/persona';
import type { ProductTour } from '@/types/productTour';

export async function createAndSaveProductTour(): Promise<ProductTour> {
  const tour = createEmptyProductTour();
  await saveProductTour(tour);
  return tour;
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
