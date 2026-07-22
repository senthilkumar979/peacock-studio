export type PersonaGender = 'female' | 'male' | 'neutral';

export interface Persona {
  id: string;
  name: string;
  occupation: string;
  age?: number;
  shortBio: string;
  /** Optional hint when picking this persona for a new tour — not shown in learner playback. */
  defaultGoal?: string;
  gender: PersonaGender;
  avatarId: string;
  company?: string;
  createdAt: number;
  updatedAt: number;
  createdBy?: string | null;
  updatedBy?: string | null;
}

export interface PersonaInput {
  name: string;
  occupation: string;
  age?: number;
  shortBio: string;
  gender: PersonaGender;
  company?: string;
  defaultGoal?: string;
}

/** Legacy fields persisted before the persona schema update. */
export interface LegacyPersonaRecord {
  role?: string;
  shortDescription?: string;
  detailedDescription?: string;
  tagline?: string;
  goal?: string;
}
