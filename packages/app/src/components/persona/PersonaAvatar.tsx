import { getPersonaAvatar } from '@/constants/personaAvatars';
import type { Persona } from '@/types/persona';

interface PersonaAvatarProps {
  persona: Pick<Persona, 'name' | 'avatarId'>;
  size?: 'sm' | 'md' | 'lg';
}

const SIZE_CLASS = {
  sm: 'h-10 w-10 text-sm',
  md: 'h-14 w-14 text-lg',
  lg: 'h-20 w-20 text-2xl',
} as const;

export const PersonaAvatar = ({ persona, size = 'md' }: PersonaAvatarProps) => {
  const avatar = getPersonaAvatar(persona.avatarId);

  function renderGraphic(avatarId: string) {
    // Small inline SVG avatars (no external assets). Keep these intentionally simple-but-distinct.
    const common = {
      fill: 'currentColor',
      stroke: 'none',
    } as const;

    switch (avatarId) {
      case 'f-1':
        return (
          <svg viewBox="0 0 64 64" className="h-[70%] w-[70%]" aria-hidden>
            <path
              d="M22 26c0-10 20-10 20 0 0 7-4 12-10 12s-10-5-10-12z"
              {...common}
            />
            <path
              d="M18 29c0-14 9-22 14-22s14 8 14 22c-3-4-8-7-14-7s-11 3-14 7z"
              {...common}
            />
            <path d="M30 38h4v8h-4z" {...common} />
          </svg>
        );
      case 'f-2':
        return (
          <svg viewBox="0 0 64 64" className="h-[70%] w-[70%]" aria-hidden>
            <path d="M22 26c0-10 20-10 20 0 0 8-4 14-10 14s-10-6-10-14z" {...common} />
            <path
              d="M16 30c0-16 9-24 20-24s20 8 20 24c-2-3-7-7-13-7-5 0-8 1-10 3-2 2-4 4-7 4z"
              {...common}
            />
            <path d="M28 40c0 4 2 6 4 6s4-2 4-6" stroke="currentColor" strokeWidth="3" fill="none" />
          </svg>
        );
      case 'f-3':
        return (
          <svg viewBox="0 0 64 64" className="h-[70%] w-[70%]" aria-hidden>
            <path d="M22 28c0-10 20-10 20 0 0 9-4 15-10 15s-10-6-10-15z" {...common} />
            <path
              d="M18 30c2-16 9-22 14-22s12 6 14 22c-4-6-9-8-14-8s-10 2-14 8z"
              {...common}
            />
            <path d="M24 22h16" stroke="currentColor" strokeWidth="4" fill="none" strokeLinecap="round" />
          </svg>
        );
      case 'm-1':
        return (
          <svg viewBox="0 0 64 64" className="h-[70%] w-[70%]" aria-hidden>
            <path d="M22 28c0-10 20-10 20 0 0 8-4 16-10 16s-10-8-10-16z" {...common} />
            <path
              d="M18 28c0-14 9-22 14-22s14 8 14 22c-3-4-8-6-14-6s-11 2-14 6z"
              {...common}
            />
            <path d="M24 44c2 4 5 6 8 6s6-2 8-6" stroke="currentColor" strokeWidth="4" fill="none" strokeLinecap="round" />
          </svg>
        );
      case 'm-2':
        return (
          <svg viewBox="0 0 64 64" className="h-[70%] w-[70%]" aria-hidden>
            <path d="M22 28c0-10 20-10 20 0 0 8-4 16-10 16s-10-8-10-16z" {...common} />
            <path d="M18 30c0-16 9-24 14-24s14 8 14 24c-2-4-7-8-14-8s-12 4-14 8z" {...common} />
            <path d="M22 36h10" stroke="currentColor" strokeWidth="3.5" fill="none" strokeLinecap="round" />
            <path d="M32 36h10" stroke="currentColor" strokeWidth="3.5" fill="none" strokeLinecap="round" />
          </svg>
        );
      case 'm-3':
        return (
          <svg viewBox="0 0 64 64" className="h-[70%] w-[70%]" aria-hidden>
            <path d="M22 29c0-10 20-10 20 0 0 9-4 15-10 15s-10-6-10-15z" {...common} />
            <path
              d="M18 29c1-15 9-23 14-23s13 8 14 23c-4-6-9-8-14-8s-10 2-14 8z"
              {...common}
            />
            <path d="M26 38c2-2 4-2 6 0 2-2 4-2 6 0" stroke="currentColor" strokeWidth="4" fill="none" strokeLinecap="round" />
          </svg>
        );
      case 'n-1':
        return (
          <svg viewBox="0 0 64 64" className="h-[70%] w-[70%]" aria-hidden>
            <path d="M22 28c0-10 20-10 20 0 0 8-4 16-10 16s-10-8-10-16z" {...common} />
            <path d="M18 30c0-16 10-24 14-24s14 8 14 24c-3-5-8-8-14-8s-11 3-14 8z" {...common} />
            <path d="M24 36h16" stroke="currentColor" strokeWidth="3.5" fill="none" strokeLinecap="round" />
          </svg>
        );
      case 'n-2':
        return (
          <svg viewBox="0 0 64 64" className="h-[70%] w-[70%]" aria-hidden>
            <path d="M22 27c0-10 20-10 20 0 0 9-4 16-10 16s-10-7-10-16z" {...common} />
            <path d="M16 30c2-16 10-24 18-24s16 8 18 24c-3-4-10-8-18-8s-15 4-18 8z" {...common} />
            <path d="M18 20h28" stroke="currentColor" strokeWidth="5" fill="none" strokeLinecap="round" />
          </svg>
        );
      case 'n-3':
        return (
          <svg viewBox="0 0 64 64" className="h-[70%] w-[70%]" aria-hidden>
            <path d="M22 29c0-10 20-10 20 0 0 8-4 15-10 15s-10-7-10-15z" {...common} />
            <path d="M18 30c2-15 10-23 14-23s12 8 14 23c-3-4-8-7-14-7s-11 3-14 7z" {...common} />
            <path d="M28 41c1 2 3 3 4 3s3-1 4-3" stroke="currentColor" strokeWidth="4" fill="none" strokeLinecap="round" />
          </svg>
        );
      default:
        return (
          <svg viewBox="0 0 64 64" className="h-[70%] w-[70%]" aria-hidden>
            <circle cx="32" cy="30" r="12" {...common} />
            <path d="M18 34c3-14 11-20 14-20s11 6 14 20c-4-4-9-6-14-6s-10 2-14 6z" {...common} />
          </svg>
        );
    }
  }

  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br font-bold text-white shadow-md ${SIZE_CLASS[size]} ${avatar?.gradientClass ?? 'from-slate-400 to-slate-600'}`}
      aria-hidden
    >
      {renderGraphic(persona.avatarId)}
    </div>
  );
};
