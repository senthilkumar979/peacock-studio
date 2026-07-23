import { useEffect, useId } from 'react';
import { Check, X } from 'lucide-react';
import { PersonaAvatar } from '@/components/persona/PersonaAvatar';
import { Button } from '@/components/ui';
import type { Persona } from '@/types/persona';

interface SwitchPersonaModalProps {
  isOpen: boolean;
  personas: Persona[];
  selectedPersonaId: string;
  onSelect: (persona: Persona) => void;
  onClose: () => void;
}

export const SwitchPersonaModal = ({
  isOpen,
  personas,
  selectedPersonaId,
  onSelect,
  onClose,
}: SwitchPersonaModalProps) => {
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const otherPersonas = personas.filter((persona) => persona.id !== selectedPersonaId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close dialog"
        className="absolute inset-0 bg-slate-900/50"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className="relative flex max-h-[min(32rem,85vh)] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-slate-900/5"
      >
        <header className="flex shrink-0 items-start justify-between gap-4 border-b border-slate-200 px-6 py-5">
          <div>
            <h2 id={titleId} className="text-lg font-semibold text-slate-900">
              Switch persona
            </h2>
            <p id={descriptionId} className="mt-1 text-sm text-slate-600">
              Choose a different persona for this tour. Your current selection is marked below.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close switch persona dialog"
            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </header>

        <ul className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-6">
          {personas.length === 0 ? (
            <li className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-600">
              No saved personas yet. Create one with New persona.
            </li>
          ) : (
            personas.map((persona) => {
              const isCurrent = persona.id === selectedPersonaId;

              return (
                <li key={persona.id} className="mb-2 last:mb-0">
                  <button
                    type="button"
                    disabled={isCurrent}
                    onClick={() => {
                      onSelect(persona);
                      onClose();
                    }}
                    aria-current={isCurrent ? 'true' : undefined}
                    className={`flex w-full items-center gap-4 rounded-xl border px-4 py-3 text-left transition ${
                      isCurrent
                        ? 'cursor-not-allowed border-peacock-200 bg-peacock-50/80 opacity-80'
                        : 'border-slate-200 bg-white hover:border-peacock-300 hover:bg-peacock-50/40'
                    }`}
                  >
                    <PersonaAvatar persona={persona} size="md" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-slate-900">
                        {persona.name}
                      </span>
                      {persona.occupation ? (
                        <span className="mt-0.5 block truncate text-xs text-slate-500">
                          {persona.occupation}
                        </span>
                      ) : null}
                    </span>
                    {isCurrent ? (
                      <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-peacock-100 px-2.5 py-1 text-xs font-semibold text-peacock-800">
                        <Check className="h-3.5 w-3.5" aria-hidden />
                        Current
                      </span>
                    ) : null}
                  </button>
                </li>
              );
            })
          )}
        </ul>

        {otherPersonas.length === 0 && personas.length > 0 ? (
          <p className="shrink-0 border-t border-slate-100 px-6 py-3 text-xs text-slate-500">
            Create another persona with New persona to switch.
          </p>
        ) : null}

        <footer className="flex shrink-0 justify-end border-t border-slate-200 px-6 py-4">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
        </footer>
      </div>
    </div>
  );
};
