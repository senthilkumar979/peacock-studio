import type { PersonaGender } from '@/types/persona';

export interface PersonaAvatarOption {
  id: string;
  gender: PersonaGender;
  label: string;
  /** Tailwind gradient classes for the avatar circle */
  gradientClass: string;
}

export const PERSONA_AVATARS: PersonaAvatarOption[] = [
  { id: 'f-1', gender: 'female', label: 'Avatar 1', gradientClass: 'from-rose-400 to-pink-600' },
  { id: 'f-2', gender: 'female', label: 'Avatar 2', gradientClass: 'from-violet-400 to-purple-600' },
  { id: 'f-3', gender: 'female', label: 'Avatar 3', gradientClass: 'from-amber-400 to-orange-500' },
  { id: 'm-1', gender: 'male', label: 'Avatar 1', gradientClass: 'from-sky-400 to-blue-600' },
  { id: 'm-2', gender: 'male', label: 'Avatar 2', gradientClass: 'from-teal-400 to-emerald-600' },
  { id: 'm-3', gender: 'male', label: 'Avatar 3', gradientClass: 'from-indigo-400 to-blue-700' },
  { id: 'n-1', gender: 'neutral', label: 'Avatar 1', gradientClass: 'from-slate-400 to-slate-600' },
  { id: 'n-2', gender: 'neutral', label: 'Avatar 2', gradientClass: 'from-peacock-400 to-peacock-700' },
  { id: 'n-3', gender: 'neutral', label: 'Avatar 3', gradientClass: 'from-cyan-400 to-teal-600' },
];

export const DEFAULT_PERSONA_ID = 'peacock-default-persona';

export function getAvatarsForGender(gender: PersonaGender): PersonaAvatarOption[] {
  return PERSONA_AVATARS.filter((avatar) => avatar.gender === gender);
}

export function getPersonaAvatar(avatarId: string): PersonaAvatarOption | undefined {
  return PERSONA_AVATARS.find((avatar) => avatar.id === avatarId);
}

export function getDefaultAvatarId(gender: PersonaGender): string {
  return getAvatarsForGender(gender)[0]?.id ?? PERSONA_AVATARS[0]?.id ?? 'n-1';
}
