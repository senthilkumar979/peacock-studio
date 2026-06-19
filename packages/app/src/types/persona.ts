export type PersonaGender = 'female' | 'male' | 'neutral';

export interface Persona {
  id: string;
  name: string;
  occupation: string;
  age?: number;
  shortBio: string;
  goal: string;
  gender: PersonaGender;
  avatarId: string;
  company?: string;
  createdAt: number;
  updatedAt: number;
}

export interface PersonaInput {
  name: string;
  occupation: string;
  age?: number;
  shortBio: string;
  goal: string;
  gender: PersonaGender;
  company?: string;
}

/** Legacy fields persisted before the persona schema update. */
export interface LegacyPersonaRecord {
  role?: string;
  shortDescription?: string;
  detailedDescription?: string;
  tagline?: string;
}
