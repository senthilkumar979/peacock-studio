import { createId } from '@peacock/shared';
import { DEFAULT_PERSONA_ID } from '@/constants/personaAvatars';
import type { Persona, PersonaInput } from '@/types/persona';
import type { ProductTour, TourDemoRef, TourFeature } from '@/types/productTour';

export function createTourDemoRef(documentId: string, order: number): TourDemoRef {
  return { id: createId(), documentId, order };
}

export function createTourFeature(title: string, order: number): TourFeature {
  return {
    id: createId(),
    title,
    description: '',
    order,
    demos: [],
  };
}

export function createEmptyProductTour(personaId: string = DEFAULT_PERSONA_ID): ProductTour {
  const now = Date.now();
  const feature = createTourFeature('Feature 1', 0);

  return {
    id: createId(),
    title: 'Untitled product tour',
    description: '',
    status: 'draft',
    personaId,
    features: [feature],
    createdAt: now,
    updatedAt: now,
  };
}

export function createDefaultPersona(): Persona {
  const now = Date.now();
  return {
    id: DEFAULT_PERSONA_ID,
    name: 'Product explorer',
    role: 'New user',
    shortDescription: 'Someone exploring the product for the first time.',
    gender: 'neutral',
    avatarId: 'n-1',
    tagline: 'Show me what this product can do',
    createdAt: now,
    updatedAt: now,
  };
}

export function createPersonaFromInput(input: PersonaInput): Persona {
  const now = Date.now();
  return {
    id: createId(),
    ...input,
    createdAt: now,
    updatedAt: now,
  };
}

export function sortTourFeatures(features: TourFeature[]): TourFeature[] {
  return [...features].sort((a, b) => a.order - b.order);
}

export function countTourDemos(tour: ProductTour): number {
  return tour.features.reduce((total, feature) => total + feature.demos.length, 0);
}
