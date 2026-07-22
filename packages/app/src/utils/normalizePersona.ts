import { getAvatarIdForGender } from '@/constants/personaAvatars';
import type { LegacyPersonaRecord, Persona } from '@/types/persona';

export function normalizePersona(raw: Persona & LegacyPersonaRecord): Persona {
  const gender = raw.gender ?? 'neutral';
  const legacyGoal = raw.goal ?? raw.tagline ?? raw.detailedDescription ?? '';

  return {
    id: raw.id,
    name: raw.name,
    occupation: raw.occupation ?? raw.role ?? '',
    age: raw.age,
    shortBio: raw.shortBio ?? raw.shortDescription ?? '',
    defaultGoal: raw.defaultGoal?.trim() || legacyGoal.trim() || undefined,
    gender,
    avatarId: getAvatarIdForGender(gender),
    company: raw.company,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
    createdBy: raw.createdBy ?? null,
    updatedBy: raw.updatedBy ?? null,
  };
}
