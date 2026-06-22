import { PersonaAvatar } from "@/components/persona/PersonaAvatar";
import type { Persona } from "@/types/persona";
import { Sparkles } from "lucide-react";

interface TourPersonaIntroPanelProps {
  persona: Persona;
  tourGoal: string;
  onContinue: () => void;
}

export const TourPersonaIntroPanel = ({
  persona,
  tourGoal,
  onContinue,
}: TourPersonaIntroPanelProps) => (
  <article className="relative mx-auto w-full max-w-2xl overflow-hidden rounded-3xl border border-slate-200 bg-white p-8 shadow-xl sm:p-10">
    <div
      className="pointer-events-none absolute inset-0 bg-gradient-to-br from-peacock-50 via-white to-brand-violet/5"
      aria-hidden
    />
    <div className="relative z-10">
      <div className="flex flex-col items-center text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/70 text-peacock-700 shadow-sm ring-1 ring-peacock-200/70">
          <Sparkles className="h-8 w-8" aria-hidden />
        </div>

        <div className="mt-4">
          <PersonaAvatar persona={persona} size="lg" />
        </div>

        <p className="mt-5 text-xs font-semibold uppercase tracking-wide text-peacock-600">
          Persona
        </p>
        <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          {persona.name}
        </h2>

        {persona.occupation ? (
          <p className="mt-2 text-base font-semibold text-slate-700">
            {persona.occupation}
          </p>
        ) : null}
        <p className="mt-1 text-sm text-slate-500">
          {persona.age ? `${persona.age} · ` : ""}
          {persona.gender === "female"
            ? "Female"
            : persona.gender === "male"
              ? "Male"
              : "Neutral"}
        </p>
        {persona.company ? (
          <p className="mt-1 text-sm text-slate-500">{persona.company}</p>
        ) : null}
        {tourGoal.trim() ? (
          <>
            <p className="mt-5 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Their goal in this tour
            </p>
            <p className="mt-2 w-fit rounded-xl bg-peacock-50 px-4 py-2 text-sm font-semibold text-peacock-800">
              {tourGoal.trim()}
            </p>
          </>
        ) : null}
      </div>

      {persona.shortBio ? (
        <div className="mt-6 rounded-2xl bg-slate-50 p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Short bio
          </p>
          <p className="mt-2 text-base leading-relaxed text-slate-700">
            {persona.shortBio}
          </p>
        </div>
      ) : null}

      <button
        type="button"
        onClick={onContinue}
        className="btn-peacock mt-8 w-full"
      >
        Continue to tour
      </button>
    </div>
  </article>
);
