import { useEffect, useState } from 'react';
import { Pencil, UserPlus } from 'lucide-react';
import { PersonaAvatar } from '@/components/persona/PersonaAvatar';
import { PersonaFormModal } from '@/components/persona/PersonaFormModal';
import { createAndSavePersona, getPersona, listPersonas, savePersona } from '@/services/productTourLibraryService';
import { useProductTourBuilderStore } from '@/store/productTourBuilderStore';
import type { Persona, PersonaInput } from '@/types/persona';

export const ProductTourPersonaSection = () => {
  const tour = useProductTourBuilderStore((state) => state.tour);
  const setPersonaId = useProductTourBuilderStore((state) => state.setPersonaId);
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

  const handleSavePersona = async (input: PersonaInput) => {
    if (editingPersona) {
      const updated: Persona = { ...editingPersona, ...input, updatedAt: Date.now() };
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
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          {persona ? <PersonaAvatar persona={persona} /> : null}
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Persona</p>
            <p className="mt-1 text-base font-semibold text-slate-900">{persona?.name ?? 'Loading…'}</p>
            {persona?.role ? <p className="text-sm text-slate-600">{persona.role}</p> : null}
            {persona?.shortDescription ? (
              <p className="mt-1 text-sm text-slate-500">{persona.shortDescription}</p>
            ) : null}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => {
              setEditingPersona(persona);
              setIsModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
          >
            <Pencil className="h-4 w-4" aria-hidden />
            Edit
          </button>
          <button
            type="button"
            onClick={() => {
              setEditingPersona(null);
              setIsModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 rounded-lg border border-peacock-200 bg-peacock-50 px-3 py-2 text-sm text-peacock-800 hover:bg-peacock-100"
          >
            <UserPlus className="h-4 w-4" aria-hidden />
            New persona
          </button>
        </div>
      </div>

      {personas.length > 1 ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {personas.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setPersonaId(item.id);
                setPersona(item);
              }}
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm ${
                tour.personaId === item.id
                  ? 'border-peacock-500 bg-peacock-50 text-peacock-800'
                  : 'border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <PersonaAvatar persona={item} size="sm" />
              {item.name}
            </button>
          ))}
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
