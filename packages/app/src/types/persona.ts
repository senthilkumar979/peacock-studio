export type PersonaGender = 'female' | 'male' | 'neutral';

export interface Persona {
  id: string;
  name: string;
  role?: string;
  shortDescription: string;
  detailedDescription?: string;
  gender: PersonaGender;
  avatarId: string;
  company?: string;
  tagline?: string;
  createdAt: number;
  updatedAt: number;
}

export interface PersonaInput {
  name: string;
  role?: string;
  shortDescription: string;
  detailedDescription?: string;
  gender: PersonaGender;
  avatarId: string;
  company?: string;
  tagline?: string;
}
