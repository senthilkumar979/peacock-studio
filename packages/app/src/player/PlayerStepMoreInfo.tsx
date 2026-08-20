import { useEffect, useId, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Info, X } from 'lucide-react';
import type { FlowStep, StepResource } from '@peacock/shared';
import { Button } from '@/components/ui';
import { hasPlayerStepExtras, PlayerStepExtras } from './PlayerStepExtras';

const DRAWER_SLIDE_TRANSITION = {
  duration: 0.45,
  ease: [0.22, 1, 0.36, 1] as const,
};

interface PlayerStepMoreInfoProps {
  step: FlowStep;
  stepResources: StepResource[];
  isEmbed?: boolean;
}

export const PlayerStepMoreInfo = ({
  step,
  stepResources,
  isEmbed = false,
}: PlayerStepMoreInfoProps) => {
  const titleId = useId();
  const [isOpen, setIsOpen] = useState(false);
  const hasExtras = hasPlayerStepExtras(step, stepResources);

  useEffect(() => {
    setIsOpen(false);
  }, [step.id]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  if (!hasExtras) return null;

  return (
    <>
      <Button
        type="button"
        variant="secondary"
        size="sm"
        onClick={() => setIsOpen(true)}
        className={`absolute z-30 inline-flex items-center gap-1.5 shadow-sm ${
          isEmbed ? 'right-1 top-1' : 'right-0 top-0 sm:right-1 sm:top-1'
        }`}
      >
        <Info className="h-3.5 w-3.5" aria-hidden />
        More info
      </Button>

      <AnimatePresence>
        {isOpen ? (
          <div className="fixed inset-0 z-50 mt-0">
            <motion.button
              type="button"
              aria-label="Dismiss more info"
              className="absolute inset-0 bg-slate-900/50"
              onClick={() => setIsOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            />
            <motion.aside
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              className="absolute inset-y-0 right-0 mt-2 mb-2 mr-2 flex w-full max-w-lg flex-col rounded-lg bg-white shadow-2xl ring-1 ring-slate-900/5"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={DRAWER_SLIDE_TRANSITION}
            >
              <header className="flex shrink-0 items-start justify-between gap-4 border-b border-slate-200 px-6 py-5">
                <h2 id={titleId} className="text-xl font-semibold text-slate-900">
                  More info
                </h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  aria-label="Close more info"
                >
                  <X className="h-5 w-5" aria-hidden />
                </Button>
              </header>
              <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
                <PlayerStepExtras step={step} stepResources={stepResources} />
              </div>
            </motion.aside>
          </div>
        ) : null}
      </AnimatePresence>
    </>
  );
};
