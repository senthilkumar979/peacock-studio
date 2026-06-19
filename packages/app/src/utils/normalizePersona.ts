import { getAvatarIdForGender } from '@/constants/personaAvatars';
import type { LegacyPersonaRecord, Persona } from '@/types/persona';

export function normalizePersona(raw: Persona & LegacyPersonaRecord): Persona {
  const gender = raw.gender ?? 'neutral';

  return {
    id: raw.id,
    name: raw.name,
    occupation: raw.occupation ?? raw.role ?? '',
    age: raw.age,
    shortBio: raw.shortBio ?? raw.shortDescription ?? '',
    goal: raw.goal ?? raw.tagline ?? raw.detailedDescription ?? '',
    gender,
    avatarId: getAvatarIdForGender(gender),
    company: raw.company,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  };
}
