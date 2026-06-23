import { useCallback, useEffect, useState } from "react";
import { ArrowLeftRight, Building2, Pencil, User, UserPlus } from "lucide-react";
import {
  CreatePersonaWithGoalDrawer,
  type CreatePersonaWithGoalResult,
} from "@/components/persona/CreatePersonaWithGoalDrawer";
import { PersonaAvatar } from "@/components/persona/PersonaAvatar";
import { PersonaFormDrawer } from "@/components/persona/PersonaFormDrawer";
import { SwitchPersonaModal } from "@/components/persona/SwitchPersonaModal";
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
  const [isSwitchModalOpen, setIsSwitchModalOpen] = useState(false);
  const [isPersonaLoading, setIsPersonaLoading] = useState(false);
  const [isSavingPersona, setIsSavingPersona] = useState(false);

  const refreshPersonas = useCallback(async () => {
    const next = await listPersonas();
    setPersonas(next);
  }, []);

  useEffect(() => {
    void refreshPersonas();
  }, [refreshPersonas]);

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
        await refreshPersonas();
        setFormMode("closed");
      } finally {
        setIsSavingPersona(false);
      }
    },
    [persona, refreshPersonas, setPersonaId],
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
        await refreshPersonas();
        setFormMode("closed");
      } finally {
        setIsSavingPersona(false);
      }
    },
    [refreshPersonas, setPersonaId, setTourGoal],
  );

  if (!tour) return null;

  const isCreateOpen = formMode === "create";
  const isEditOpen = formMode === "edit";
  const isOverlayOpen = isCreateOpen || isEditOpen || isSwitchModalOpen;
  const showLiveGoalWarning = tour.status === "live";
  const hasAlternatePersona = personas.some((item) => item.id !== tour.personaId);

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
                Sheela is the default persona. Switch or create one for this tour.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setIsSwitchModalOpen(true)}
                disabled={isOverlayOpen && !isSwitchModalOpen}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <ArrowLeftRight className="h-4 w-4" aria-hidden />
                Switch persona
              </button>
              <button
                type="button"
                onClick={() => setFormMode("create")}
                disabled={isOverlayOpen && !isCreateOpen}
                className="inline-flex items-center gap-1.5 rounded-xl border border-peacock-200 bg-peacock-50 px-3.5 py-2 text-sm font-semibold text-peacock-800 shadow-sm transition hover:bg-peacock-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <UserPlus className="h-4 w-4" aria-hidden />
                New persona
              </button>
            </div>
          </div>
        </div>

        <div className="relative z-10 px-5 py-5 sm:px-6">
          <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Persona
          </p>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex min-w-0 items-start gap-4">
              {persona ? <PersonaAvatar persona={persona} size="lg" /> : null}
              <div className="min-w-0">
                <p className="text-xl font-bold text-slate-900">
                  {isPersonaLoading
                    ? "Loading persona…"
                    : (persona?.name ?? "Sheela")}
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
              disabled={!persona || isPersonaLoading || isOverlayOpen}
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

          {!hasAlternatePersona && personas.length > 0 ? (
            <p className="mt-4 text-sm text-slate-500">
              Only one persona saved. Use Switch persona after creating another, or add one with New persona.
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

      <SwitchPersonaModal
        isOpen={isSwitchModalOpen}
        personas={personas}
        selectedPersonaId={tour.personaId}
        onSelect={handleSelectPersona}
        onClose={() => setIsSwitchModalOpen(false)}
      />

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
