import { useEffect, useMemo, useState } from "react";
import { Building2, Pencil, User, UserPlus } from "lucide-react";
import { PersonaAvatar } from "@/components/persona/PersonaAvatar";
import { PersonaFormModal } from "@/components/persona/PersonaFormModal";
import {
  createAndSavePersona,
  getPersona,
  listPersonas,
  savePersona,
} from "@/services/productTourLibraryService";
import { useProductTourBuilderStore } from "@/store/productTourBuilderStore";
import type { Persona, PersonaInput } from "@/types/persona";

export const ProductTourPersonaSection = () => {
  const tour = useProductTourBuilderStore((state) => state.tour);
  const setPersonaId = useProductTourBuilderStore(
    (state) => state.setPersonaId,
  );
  const [persona, setPersona] = useState<Persona | null>(null);
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPersona, setEditingPersona] = useState<Persona | null>(null);

  useEffect(() => {
    let cancelled = false;
    void listPersonas().then((next) => {
      if (!cancelled) setPersonas(next);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!tour) return;
    let cancelled = false;
    void getPersona(tour.personaId).then((next) => {
      if (!cancelled) setPersona(next ?? null);
    });
    return () => {
      cancelled = true;
    };
  }, [tour?.personaId]);

  if (!tour) return null;

  const selectedPersonaCountLabel = useMemo(
    () => `${personas.length} saved persona${personas.length === 1 ? "" : "s"}`,
    [personas.length],
  );

  const handleSavePersona = async (input: PersonaInput) => {
    if (editingPersona) {
      const updated: Persona = {
        ...editingPersona,
        ...input,
        updatedAt: Date.now(),
      };
      await savePersona(updated);
      setPersonaId(updated.id);
      setPersona(updated);
    } else {
      const created = await createAndSavePersona(input);
      setPersonaId(created.id);
      setPersona(created);
    }
    const nextPersonas = await listPersonas();
    setPersonas(nextPersonas);
    setIsModalOpen(false);
    setEditingPersona(null);
  };

  return (
    <section className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg shadow-slate-200/60">
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-peacock-50/70 via-white to-brand-violet/5"
        aria-hidden
      />

      <div className="relative border-b border-slate-100 px-5 py-4 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-peacock-700">
              Tour persona
            </p>
            <p className="mt-1 text-sm font-medium text-slate-500">
              {selectedPersonaCountLabel}
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setEditingPersona(null);
              setIsModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 rounded-xl border border-peacock-200 bg-peacock-50 px-3.5 py-2 text-sm font-semibold text-peacock-800 shadow-sm transition hover:bg-peacock-100"
          >
            <UserPlus className="h-4 w-4" aria-hidden />
            New persona
          </button>
        </div>
      </div>

      <div className="relative px-5 py-5 sm:px-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-4">
            {persona ? <PersonaAvatar persona={persona} size="lg" /> : null}
            <div className="min-w-0">
              <p className="text-xl font-bold text-slate-900">
                {persona?.name ?? "Loading…"}
              </p>
              <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-slate-600">
                {persona?.role ? (
                  <span className="inline-flex items-center gap-1.5">
                    <User className="h-4 w-4 text-slate-400" aria-hidden />
                    {persona.role}
                  </span>
                ) : null}
                {persona?.company ? (
                  <span className="inline-flex items-center gap-1.5">
                    <Building2 className="h-4 w-4 text-slate-400" aria-hidden />
                    {persona.company}
                  </span>
                ) : null}
              </div>
              {persona?.tagline ? (
                <p className="mt-3 rounded-lg bg-peacock-50/80 px-3 py-1.5 text-sm font-medium text-peacock-800 w-fit">
                  {persona.tagline}
                </p>
              ) : null}
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setEditingPersona(persona);
              setIsModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 rounded-lg hover:bg-slate-100 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition"
          >
            <Pencil className="h-4 w-4" aria-hidden />
          </button>
        </div>

        {persona?.shortDescription ? (
          <p className="mt-4 text-sm leading-relaxed text-slate-600">
            {persona.shortDescription}
          </p>
        ) : null}

        {persona?.detailedDescription ? (
          <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Detailed description
            </p>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              {persona.detailedDescription}
            </p>
          </div>
        ) : null}
      </div>

      {personas.length > 1 ? (
        <div className="relative border-t border-slate-100 px-5 py-4 sm:px-6">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Switch persona
          </p>
          <div className="flex flex-wrap gap-2">
            {personas.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setPersonaId(item.id);
                  setPersona(item);
                }}
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition ${
                  tour.personaId === item.id
                    ? "border-peacock-500 bg-peacock-50 text-peacock-800 shadow-sm"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                <PersonaAvatar persona={item} size="sm" />
                {item.name}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <PersonaFormModal
        isOpen={isModalOpen}
        initialPersona={editingPersona}
        onSave={(input) => void handleSavePersona(input)}
        onClose={() => {
          setIsModalOpen(false);
          setEditingPersona(null);
        }}
      />
    </section>
  );
};
