import { useEffect, useId, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, X } from 'lucide-react';
import type { PersonaInput } from '@/types/persona';
import { PersonaFormFields } from './PersonaFormFields';

const DRAWER_SLIDE_TRANSITION = {
  duration: 1.25,
  ease: [0.22, 1, 0.36, 1] as const,
};

export interface CreatePersonaWithGoalResult {
  persona: PersonaInput;
  tourGoal: string;
  saveDefaultGoal: boolean;
}

interface CreatePersonaWithGoalDrawerProps {
  isOpen: boolean;
  isSaving?: boolean;
  onSave: (result: CreatePersonaWithGoalResult) => void;
  onClose: () => void;
}

export const CreatePersonaWithGoalDrawer = ({
  isOpen,
  isSaving = false,
  onSave,
  onClose,
}: CreatePersonaWithGoalDrawerProps) => {
  const titleId = useId();
  const identityFormId = useId();
  const [step, setStep] = useState<'identity' | 'goal'>('identity');
  const [pendingPersona, setPendingPersona] = useState<PersonaInput | null>(null);
  const [tourGoal, setTourGoal] = useState('');
  const [saveDefaultGoal, setSaveDefaultGoal] = useState(false);
  const [goalError, setGoalError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setStep('identity');
      setPendingPersona(null);
      setTourGoal('');
      setSaveDefaultGoal(false);
      setGoalError(null);
    }
  }, [isOpen]);

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

  const handleIdentitySave = (input: PersonaInput) => {
    setPendingPersona(input);
    setStep('goal');
    setGoalError(null);
  };

  const handleGoalSubmit = () => {
    if (!pendingPersona) return;
    const trimmedGoal = tourGoal.trim();
    if (!trimmedGoal) {
      setGoalError('Tour goal is required.');
      return;
    }

    onSave({
      persona: pendingPersona,
      tourGoal: trimmedGoal,
      saveDefaultGoal,
    });
  };

  const personaName = pendingPersona?.name.trim() || 'this persona';

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
                  New persona · Step {step === 'identity' ? '1' : '2'} of 2
                </p>
                <h2 id={titleId} className="mt-1 text-xl font-semibold text-slate-900">
                  {step === 'identity' ? 'Create persona' : 'Set tour goal'}
                </h2>
                <p className="mt-2 text-sm text-slate-600">
                  {step === 'identity'
                    ? 'Define who this tour speaks to. Tour goals are set per tour, not on the persona profile.'
                    : `Why is ${personaName} taking this tour? This appears on the intro slide.`}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                disabled={isSaving}
                aria-label="Close drawer"
                className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <X className="h-5 w-5" aria-hidden />
              </button>
            </header>

            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
              {step === 'identity' ? (
                <PersonaFormFields
                  key="create-identity"
                  formId={identityFormId}
                  variant="plain"
                  showActions={false}
                  autoFocusName
                  isSaving={isSaving}
                  onSave={handleIdentitySave}
                  onCancel={onClose}
                />
              ) : (
                <div className="space-y-4 text-slate-900">
                  <label className="block text-sm text-slate-900">
                    <span className="font-medium text-slate-900">Tour goal</span>
                    <textarea
                      value={tourGoal}
                      onChange={(event) => {
                        setTourGoal(event.target.value);
                        setGoalError(null);
                      }}
                      rows={3}
                      autoFocus
                      disabled={isSaving}
                      placeholder="e.g. Reduce time spent on manual user provisioning"
                      className="mt-1 w-full resize-none rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 disabled:opacity-60"
                    />
                  </label>
                  <p className="text-sm text-slate-600">
                    Shown on the persona intro slide for this tour only.
                  </p>
                  <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-900">
                    <input
                      type="checkbox"
                      checked={saveDefaultGoal}
                      onChange={(event) => setSaveDefaultGoal(event.target.checked)}
                      disabled={isSaving}
                      className="mt-0.5 rounded border-slate-300"
                    />
                    <span>
                      <span className="font-medium text-slate-800">
                        Save as default goal for {personaName}
                      </span>
                      <span className="mt-1 block text-slate-500">
                        Pre-fills the tour goal when you pick this persona on future tours.
                      </span>
                    </span>
                  </label>
                  {goalError ? <p className="text-sm text-red-600">{goalError}</p> : null}
                </div>
              )}
            </div>

            <footer className="flex shrink-0 justify-between gap-2 border-t border-slate-200 px-6 py-4">
              {step === 'goal' ? (
                <button
                  type="button"
                  onClick={() => setStep('identity')}
                  disabled={isSaving}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <ArrowLeft className="h-4 w-4" aria-hidden />
                  Back
                </button>
              ) : (
                <span />
              )}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSaving}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>
                {step === 'identity' ? (
                  <button
                    type="submit"
                    form={identityFormId}
                    disabled={isSaving}
                    className="btn-peacock disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Continue
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleGoalSubmit}
                    disabled={isSaving}
                    className="btn-peacock disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isSaving ? 'Saving…' : 'Create persona & set goal'}
                  </button>
                )}
              </div>
            </footer>
          </motion.aside>
        </div>
      ) : null}
    </AnimatePresence>
  );
};
