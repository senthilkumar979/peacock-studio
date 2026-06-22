import { useEffect, useId } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import type { Persona, PersonaInput } from '@/types/persona';
import { PersonaFormFields } from './PersonaFormFields';

const DRAWER_SLIDE_TRANSITION = {
  duration: 1.25,
  ease: [0.22, 1, 0.36, 1] as const,
};

interface PersonaFormDrawerProps {
  isOpen: boolean;
  mode: 'create' | 'edit';
  initialPersona?: Persona | null;
  isSaving?: boolean;
  onSave: (input: PersonaInput) => void;
  onClose: () => void;
}

export const PersonaFormDrawer = ({
  isOpen,
  mode,
  initialPersona,
  isSaving = false,
  onSave,
  onClose,
}: PersonaFormDrawerProps) => {
  const titleId = useId();
  const formId = useId();
  const isEdit = mode === 'edit';

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isSaving) onClose();
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, isSaving, onClose]);

  return (
    <AnimatePresence>
      {isOpen ? (
        <div className="fixed inset-0 z-50 mt-0">
          <motion.button
            type="button"
            aria-label="Close drawer"
            className="absolute inset-0 bg-slate-900/50"
            onClick={onClose}
            disabled={isSaving}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.25, ease: [0.22, 1, 0.36, 1] as const }}
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="absolute inset-y-0 right-0 mt-2 mb-2 mr-2 flex w-full max-w-2xl flex-col rounded-lg bg-white shadow-2xl ring-1 ring-slate-900/5"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={DRAWER_SLIDE_TRANSITION}
          >
            <header className="flex shrink-0 items-start justify-between gap-4 border-b border-slate-200 px-6 py-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-peacock-600">
                  Tour persona
                </p>
                <h2 id={titleId} className="mt-1 text-xl font-semibold text-slate-900">
                  {isEdit ? 'Edit persona' : 'Create persona'}
                </h2>
                <p className="mt-2 text-sm text-slate-600">
                  Update identity details for this buyer or user role. Tour goals
                  are set per tour in the section below.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                disabled={isSaving}
                aria-label="Close persona drawer"
                className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <X className="h-5 w-5" aria-hidden />
              </button>
            </header>

            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
              <PersonaFormFields
                key={isEdit ? initialPersona?.id ?? 'edit' : 'create'}
                formId={formId}
                variant="plain"
                showActions={false}
                autoFocusName={!isEdit}
                initialPersona={initialPersona}
                isSaving={isSaving}
                onSave={onSave}
                onCancel={onClose}
              />
            </div>

            <footer className="flex shrink-0 justify-end gap-2 border-t border-slate-200 px-6 py-4">
              <button
                type="button"
                onClick={onClose}
                disabled={isSaving}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                form={formId}
                disabled={isSaving}
                className="btn-peacock disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSaving ? 'Saving…' : 'Save persona'}
              </button>
            </footer>
          </motion.aside>
        </div>
      ) : null}
    </AnimatePresence>
  );
};
