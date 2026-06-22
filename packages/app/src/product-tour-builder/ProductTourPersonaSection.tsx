import { useCallback, useEffect, useState } from "react";
import { Building2, Pencil, User, UserPlus } from "lucide-react";
import {
  CreatePersonaWithGoalDrawer,
  type CreatePersonaWithGoalResult,
} from "@/components/persona/CreatePersonaWithGoalDrawer";
import { PersonaAvatar } from "@/components/persona/PersonaAvatar";
import { PersonaFormDrawer } from "@/components/persona/PersonaFormDrawer";
import { getAvatarIdForGender } from "@/constants/personaAvatars";
import { ProductTourGoalField } from "@/product-tour-builder/ProductTourGoalField";
import {
  createAndSavePersona,
  getPersona,
  listPersonas,
  savePersona,
} from "@/services/productTourLibraryService";
import { useProductTourBuilderStore } from "@/store/productTourBuilderStore";
import type { Persona, PersonaInput } from "@/types/persona";

type PersonaFormMode = "closed" | "create" | "edit";

export const ProductTourPersonaSection = () => {
  const tour = useProductTourBuilderStore((state) => state.tour);
  const setPersonaId = useProductTourBuilderStore((state) => state.setPersonaId);
  const setTourGoal = useProductTourBuilderStore((state) => state.setTourGoal);
  const [persona, setPersona] = useState<Persona | null>(null);
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [formMode, setFormMode] = useState<PersonaFormMode>("closed");
  const [isPersonaLoading, setIsPersonaLoading] = useState(false);
  const [isSavingPersona, setIsSavingPersona] = useState(false);

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
    if (!tour?.personaId) {
      setPersona(null);
      setIsPersonaLoading(false);
      return;
    }

    let cancelled = false;
    setIsPersonaLoading(true);
    void getPersona(tour.personaId).then((next) => {
      if (cancelled) return;
      setPersona(next ?? null);
      setIsPersonaLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [tour?.personaId]);

  const handleSelectPersona = useCallback(
    (nextPersona: Persona) => {
      setFormMode("closed");
      setPersonaId(nextPersona.id);
      setPersona(nextPersona);

      const currentGoal = useProductTourBuilderStore.getState().tour?.tourGoal ?? "";
      if (!currentGoal.trim() && nextPersona.defaultGoal) {
        setTourGoal(nextPersona.defaultGoal);
      }
    },
    [setPersonaId, setTourGoal],
  );

  const handleCloseForm = useCallback(() => {
    if (isSavingPersona) return;
    setFormMode("closed");
  }, [isSavingPersona]);

  const handleSavePersonaEdit = useCallback(
    async (input: PersonaInput) => {
      if (!persona) return;

      setIsSavingPersona(true);
      try {
        const updated: Persona = {
          ...persona,
          ...input,
          avatarId: getAvatarIdForGender(input.gender),
          updatedAt: Date.now(),
        };
        await savePersona(updated);
        setPersonaId(updated.id);
        setPersona(updated);
        const nextPersonas = await listPersonas();
        setPersonas(nextPersonas);
        setFormMode("closed");
      } finally {
        setIsSavingPersona(false);
      }
    },
    [persona, setPersonaId],
  );

  const handleCreateWithGoal = useCallback(
    async (result: CreatePersonaWithGoalResult) => {
      setIsSavingPersona(true);
      try {
        const created = await createAndSavePersona({
          ...result.persona,
          defaultGoal: result.saveDefaultGoal ? result.tourGoal : undefined,
        });
        setPersonaId(created.id);
        setTourGoal(result.tourGoal);
        setPersona(created);
        const nextPersonas = await listPersonas();
        setPersonas(nextPersonas);
        setFormMode("closed");
      } finally {
        setIsSavingPersona(false);
      }
    },
    [setPersonaId, setTourGoal],
  );

  if (!tour) return null;

  const selectedPersonaCountLabel = `${personas.length} saved persona${personas.length === 1 ? "" : "s"}`;
  const isCreateOpen = formMode === "create";
  const isEditOpen = formMode === "edit";
  const showLiveGoalWarning = tour.status === "live";

  return (
    <>
      <section className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg shadow-slate-200/60">
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-br from-peacock-50/70 via-white to-brand-violet/5"
          aria-hidden
        />

        <div className="relative z-10 border-b border-slate-100 px-5 py-4 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-peacock-700">
                Tour audience
              </p>
              <p className="mt-1 text-sm font-medium text-slate-500">
                Pick a persona, then set the goal for this tour.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setFormMode("create")}
              disabled={isCreateOpen || isEditOpen}
              className="inline-flex items-center gap-1.5 rounded-xl border border-peacock-200 bg-peacock-50 px-3.5 py-2 text-sm font-semibold text-peacock-800 shadow-sm transition hover:bg-peacock-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <UserPlus className="h-4 w-4" aria-hidden />
              New persona
            </button>
          </div>
        </div>

        <div className="relative z-10 border-b border-slate-100 px-5 py-4 sm:px-6">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            1 · Persona · {selectedPersonaCountLabel}
          </p>
          {personas.length === 0 ? (
            <p className="text-sm text-slate-500">
              No personas yet. Create one to anchor this tour.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {personas.map((item) => {
                const isSelected = tour.personaId === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelectPersona(item)}
                    aria-pressed={isSelected}
                    disabled={isCreateOpen || isEditOpen}
                    className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition disabled:cursor-not-allowed disabled:opacity-60 ${
                      isSelected
                        ? "border-peacock-500 bg-peacock-50 text-peacock-800 shadow-sm"
                        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <PersonaAvatar persona={item} size="sm" />
                    {item.name}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="relative z-10 px-5 py-5 sm:px-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex min-w-0 items-start gap-4">
              {persona ? <PersonaAvatar persona={persona} size="lg" /> : null}
              <div className="min-w-0">
                <p className="text-xl font-bold text-slate-900">
                  {isPersonaLoading
                    ? "Loading persona…"
                    : (persona?.name ?? "No persona selected")}
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-slate-600">
                  {persona?.occupation ? (
                    <span className="inline-flex items-center gap-1.5">
                      <User className="h-4 w-4 text-slate-400" aria-hidden />
                      {persona.occupation}
                    </span>
                  ) : null}
                  {persona?.age ? <span>Age {persona.age}</span> : null}
                  {persona?.company ? (
                    <span className="inline-flex items-center gap-1.5">
                      <Building2
                        className="h-4 w-4 text-slate-400"
                        aria-hidden
                      />
                      {persona.company}
                    </span>
                  ) : null}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setFormMode("edit")}
              disabled={!persona || isPersonaLoading || isCreateOpen || isEditOpen}
              className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Edit persona"
            >
              <Pencil className="h-4 w-4" aria-hidden />
              Edit persona
            </button>
          </div>

          {persona?.shortBio ? (
            <p className="mt-4 text-sm leading-relaxed text-slate-600">
              {persona.shortBio}
            </p>
          ) : null}
        </div>

        <ProductTourGoalField
          value={tour.tourGoal}
          personaName={persona?.name}
          onChange={setTourGoal}
          showLiveWarning={showLiveGoalWarning}
        />
      </section>

      <CreatePersonaWithGoalDrawer
        isOpen={isCreateOpen}
        isSaving={isSavingPersona}
        onSave={handleCreateWithGoal}
        onClose={handleCloseForm}
      />

      <PersonaFormDrawer
        isOpen={isEditOpen}
        mode="edit"
        initialPersona={persona}
        isSaving={isSavingPersona}
        onSave={handleSavePersonaEdit}
        onClose={handleCloseForm}
      />
    </>
  );
};
