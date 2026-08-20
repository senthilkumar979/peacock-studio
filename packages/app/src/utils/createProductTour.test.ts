import { describe, expect, it, vi } from 'vitest';
import { DEFAULT_PERSONA_ID } from '@/constants/personaAvatars';
import {
  countTourDemos,
  createDefaultPersona,
  createEmptyProductTour,
  createPersonaFromInput,
  createTourDemoRef,
  createTourFeature,
  sortTourFeatures,
} from './createProductTour';

vi.mock('@peacock/shared', async () => {
  const actual = await vi.importActual<typeof import('@peacock/shared')>('@peacock/shared');
  let n = 0;
  return {
    ...actual,
    createId: () => `id-${++n}`,
  };
});

describe('createProductTour helpers', () => {
  it('creates demo refs, features, and empty tours', () => {
    expect(createTourDemoRef('doc-1', 2)).toEqual({
      id: expect.stringMatching(/^id-/),
      documentId: 'doc-1',
      order: 2,
    });

    const feature = createTourFeature('Intro', 1);
    expect(feature).toMatchObject({ title: 'Intro', order: 1, demos: [] });

    const tour = createEmptyProductTour();
    expect(tour.personaId).toBe(DEFAULT_PERSONA_ID);
    expect(tour.status).toBe('draft');
    expect(tour.features).toHaveLength(1);
    expect(tour.title).toBe('Untitled product tour');
  });

  it('creates default and input-based personas', () => {
    const persona = createDefaultPersona();
    expect(persona.id).toBe(DEFAULT_PERSONA_ID);
    expect(persona.gender).toBe('female');
    expect(persona.avatarId).toBe('female');

    const custom = createPersonaFromInput({
      name: 'Alex',
      occupation: 'PM',
      age: 35,
      shortBio: 'Bio',
      gender: 'neutral',
    });
    expect(custom.avatarId).toBe('neutral');
    expect(custom.name).toBe('Alex');
  });

  it('sorts features and counts demos', () => {
    const features = [
      createTourFeature('B', 2),
      createTourFeature('A', 1),
    ];
    features[0]!.demos = [createTourDemoRef('d1', 0), createTourDemoRef('d2', 1)];
    features[1]!.demos = [createTourDemoRef('d3', 0)];

    expect(sortTourFeatures(features).map((f) => f.title)).toEqual(['A', 'B']);
    expect(
      countTourDemos({
        id: 't',
        title: '',
        description: '',
        status: 'draft',
        personaId: 'p',
        tourGoal: '',
        features,
        createdAt: 1,
        updatedAt: 2,
      }),
    ).toBe(3);
  });
});
