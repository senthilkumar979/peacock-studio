import { Clock } from 'lucide-react';
import { PersonaAvatar } from '@/components/persona/PersonaAvatar';
import type { Persona } from '@/types/persona';
import type { ProductTour } from '@/types/productTour';

interface TourIntroPanelProps {
  tour: ProductTour;
  persona: Persona;
  estimatedMinutes: number | null;
  onStart: () => void;
}

export const TourIntroPanel = ({
  tour,
  persona,
  estimatedMinutes,
  onStart,
}: TourIntroPanelProps) => (
  <article className="mx-auto w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-8 shadow-xl sm:p-10">
    <div className="flex items-start gap-4">
      <PersonaAvatar persona={persona} size="lg" />
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-peacock-600">Persona</p>
        <h2 className="mt-1 text-2xl font-bold text-slate-900">{persona.name}</h2>
        {persona.role ? <p className="text-sm text-slate-600">{persona.role}</p> : null}
        {persona.tagline ? <p className="mt-1 text-sm italic text-slate-500">{persona.tagline}</p> : null}
      </div>
    </div>

    <div className="mt-8">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Product tour</p>
      <h3 className="mt-2 text-3xl font-bold text-slate-900">{tour.title}</h3>
      {tour.description ? (
        <p className="mt-3 text-base leading-relaxed text-slate-600">{tour.description}</p>
      ) : null}
      {persona.shortDescription ? (
        <p className="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">{persona.shortDescription}</p>
      ) : null}
      {estimatedMinutes ? (
        <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-peacock-50 px-3 py-1 text-sm font-medium text-peacock-800">
          <Clock className="h-4 w-4" aria-hidden />
          ~{estimatedMinutes} min tour
        </p>
      ) : null}
    </div>

    <button type="button" onClick={onStart} className="btn-peacock mt-8 w-full sm:w-auto">
      Start tour
    </button>
  </article>
);
