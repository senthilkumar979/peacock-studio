import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { CircleDot, Puzzle, Share2 } from 'lucide-react';
import { PEACOCK_LOGO_SRC } from '@/constants/branding';

interface OnboardingStep {
  step: string;
  title: string;
  description: string;
  icon: LucideIcon;
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    step: '01',
    title: 'Install the extension',
    description: 'Load the Peacock extension in Chrome and pin it to your toolbar for quick access.',
    icon: Puzzle,
  },
  {
    step: '02',
    title: 'Record a flow',
    description: 'Navigate any website, click Start Recording, and perform the steps you want to document.',
    icon: CircleDot,
  },
  {
    step: '03',
    title: 'Refine & share',
    description: 'Stop recording to open the editor. Polish steps, export PDF, or share a link.',
    icon: Share2,
  },
];

export const DashboardEmptyState = () => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4 }}
    className="mx-6 mb-6 overflow-hidden rounded-2xl border border-dashed border-slate-300 bg-gradient-to-b from-slate-50 to-white"
  >
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.1 }}
      className="flex flex-col items-center px-8 pb-10 pt-12 text-center"
    >
      <motion.div
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-peacock-500 to-brand-violet p-4 shadow-lg shadow-peacock-500/25"
      >
        <img src={PEACOCK_LOGO_SRC} alt="" width={48} height={48} className="h-12 w-12 object-contain" />
      </motion.div>
      <h3 className="text-2xl font-bold tracking-tight text-slate-900">Start your first documentation</h3>
      <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-slate-600">
        Your library is empty. Record a browser flow and Peacock will turn it into a polished,
        step-by-step guide stored securely on this device.
      </p>
    </motion.div>

    <div className="grid gap-px border-t border-slate-200 bg-slate-200 sm:grid-cols-3">
      {ONBOARDING_STEPS.map((item, index) => {
        const Icon = item.icon;
        return (
          <motion.article
            key={item.step}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + index * 0.08 }}
            className="flex flex-col bg-white p-6 text-left"
          >
            <div className="flex items-center gap-3">
              <span className="inline-flex rounded-lg bg-peacock-50 p-2 text-peacock-600 ring-1 ring-peacock-100">
                <Icon className="h-4 w-4" aria-hidden />
              </span>
              <span className="text-xs font-bold tracking-widest text-peacock-600">{item.step}</span>
            </div>
            <h4 className="mt-3 font-semibold text-slate-900">{item.title}</h4>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.description}</p>
          </motion.article>
        );
      })}
    </div>
  </motion.div>
);
