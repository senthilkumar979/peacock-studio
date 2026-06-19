import type { PersonaGender } from '@/types/persona';

export interface PersonaAvatarOption {
  id: string;
  gender: PersonaGender;
  label: string;
  /** Tailwind gradient classes for the avatar circle */
  gradientClass: string;
}

export const PERSONA_AVATARS: PersonaAvatarOption[] = [
  { id: 'female', gender: 'female', label: 'Female', gradientClass: 'from-rose-400 to-pink-600' },
  { id: 'male', gender: 'male', label: 'Male', gradientClass: 'from-sky-400 to-blue-600' },
  { id: 'neutral', gender: 'neutral', label: 'Neutral', gradientClass: 'from-peacock-400 to-peacock-700' },
];

export const DEFAULT_PERSONA_ID = 'peacock-default-persona';

const LEGACY_AVATAR_GENDER: Record<string, PersonaGender> = {
  'f-1': 'female',
  'f-2': 'female',
  'f-3': 'female',
  'm-1': 'male',
  'm-2': 'male',
  'm-3': 'male',
  'n-1': 'neutral',
  'n-2': 'neutral',
  'n-3': 'neutral',
};

export function getAvatarIdForGender(gender: PersonaGender): string {
  return PERSONA_AVATARS.find((avatar) => avatar.gender === gender)?.id ?? 'neutral';
}

export function getPersonaAvatar(avatarId: string): PersonaAvatarOption | undefined {
  const direct = PERSONA_AVATARS.find((avatar) => avatar.id === avatarId);
  if (direct) return direct;

  const legacyGender = LEGACY_AVATAR_GENDER[avatarId];
  if (legacyGender) {
    return PERSONA_AVATARS.find((avatar) => avatar.gender === legacyGender);
  }

  return PERSONA_AVATARS.find((avatar) => avatar.id === 'neutral');
}
