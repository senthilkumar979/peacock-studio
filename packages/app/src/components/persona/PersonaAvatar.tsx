import { getPersonaAvatar } from '@/constants/personaAvatars';
import type { Persona, PersonaGender } from '@/types/persona';

interface PersonaAvatarProps {
  persona: Pick<Persona, 'name' | 'avatarId'>;
  size?: 'sm' | 'md' | 'lg';
}

const SIZE_CLASS = {
  sm: 'h-10 w-10 text-sm',
  md: 'h-14 w-14 text-lg',
  lg: 'h-20 w-20 text-2xl',
} as const;

function renderGenderGraphic(gender: PersonaGender) {
  const common = {
    fill: 'currentColor',
    stroke: 'none',
  } as const;

  switch (gender) {
    case 'female':
      return (
        <svg viewBox="0 0 64 64" className="h-[70%] w-[70%]" aria-hidden>
          <path d="M22 26c0-10 20-10 20 0 0 7-4 12-10 12s-10-5-10-12z" {...common} />
          <path d="M18 29c0-14 9-22 14-22s14 8 14 22c-3-4-8-7-14-7s-11 3-14 7z" {...common} />
          <path d="M30 38h4v8h-4z" {...common} />
        </svg>
      );
    case 'male':
      return (
        <svg viewBox="0 0 64 64" className="h-[70%] w-[70%]" aria-hidden>
          <path d="M22 28c0-10 20-10 20 0 0 8-4 16-10 16s-10-8-10-16z" {...common} />
          <path d="M18 28c0-14 9-22 14-22s14 8 14 22c-3-4-8-6-14-6s-11 2-14 6z" {...common} />
          <path
            d="M24 44c2 4 5 6 8 6s6-2 8-6"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
          />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 64 64" className="h-[70%] w-[70%]" aria-hidden>
          <path d="M22 27c0-10 20-10 20 0 0 9-4 16-10 16s-10-7-10-16z" {...common} />
          <path d="M16 30c2-16 10-24 18-24s16 8 18 24c-3-4-10-8-18-8s-15 4-18 8z" {...common} />
          <path
            d="M18 20h28"
            stroke="currentColor"
            strokeWidth="5"
            fill="none"
            strokeLinecap="round"
          />
        </svg>
      );
  }
}

export const PersonaAvatar = ({ persona, size = 'md' }: PersonaAvatarProps) => {
  const avatar = getPersonaAvatar(persona.avatarId);
  const gender = avatar?.gender ?? 'neutral';

  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br font-bold text-white shadow-md ${SIZE_CLASS[size]} ${avatar?.gradientClass ?? 'from-slate-400 to-slate-600'}`}
      aria-hidden
    >
      {renderGenderGraphic(gender)}
    </div>
  );
};
