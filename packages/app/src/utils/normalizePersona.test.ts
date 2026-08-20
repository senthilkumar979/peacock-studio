import { describe, expect, it } from 'vitest';
import { normalizePersona } from './normalizePersona';

describe('normalizePersona', () => {
  it('maps modern fields and defaults gender to neutral', () => {
    const persona = normalizePersona({
      id: 'p1',
      name: 'Ada',
      occupation: 'Engineer',
      age: 30,
      shortBio: 'Builds things',
      defaultGoal: 'Learn flows',
      createdAt: 1,
      updatedAt: 2,
    } as Parameters<typeof normalizePersona>[0]);

    expect(persona.gender).toBe('neutral');
    expect(persona.avatarId).toBe('neutral');
    expect(persona.occupation).toBe('Engineer');
    expect(persona.shortBio).toBe('Builds things');
    expect(persona.defaultGoal).toBe('Learn flows');
    expect(persona.createdBy).toBeNull();
    expect(persona.updatedBy).toBeNull();
  });

  it('falls back to legacy role / tagline / shortDescription fields', () => {
    const persona = normalizePersona({
      id: 'p2',
      name: 'Bob',
      role: 'Manager',
      age: 40,
      shortDescription: 'Leads a team',
      tagline: 'Ship docs',
      gender: 'male',
      createdAt: 1,
      updatedAt: 2,
      createdBy: 'a@x.com',
      updatedBy: 'b@x.com',
      company: 'Acme',
    } as Parameters<typeof normalizePersona>[0]);

    expect(persona.occupation).toBe('Manager');
    expect(persona.shortBio).toBe('Leads a team');
    expect(persona.defaultGoal).toBe('Ship docs');
    expect(persona.avatarId).toBe('male');
    expect(persona.company).toBe('Acme');
    expect(persona.createdBy).toBe('a@x.com');
  });

  it('uses detailedDescription when goal and tagline are absent', () => {
    const persona = normalizePersona({
      id: 'p3',
      name: 'Cara',
      age: 28,
      detailedDescription: '  Explore UI  ',
      gender: 'female',
      createdAt: 1,
      updatedAt: 2,
    } as Parameters<typeof normalizePersona>[0]);

    expect(persona.defaultGoal).toBe('Explore UI');
    expect(persona.avatarId).toBe('female');
  });

  it('omits defaultGoal when all goal sources are blank', () => {
    const persona = normalizePersona({
      id: 'p4',
      name: 'Dan',
      age: 22,
      defaultGoal: '   ',
      goal: '',
      createdAt: 1,
      updatedAt: 2,
    } as Parameters<typeof normalizePersona>[0]);

    expect(persona.defaultGoal).toBeUndefined();
  });
});
