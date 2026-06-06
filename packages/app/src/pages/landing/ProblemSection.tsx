import { motion } from 'framer-motion';
import { AlertTriangle, Clock, Layers } from 'lucide-react';
import { LandingSectionShell } from './LandingSectionShell';

const PAINS = [
  {
    icon: Clock,
    title: 'Documentation takes longer than the workflow itself',
    copy: 'Teams screenshot every step, write captions in docs, and rebuild the same guide when the UI changes.',
  },
  {
    icon: Layers,
    title: 'Demos don’t scale with the product',
    copy: 'Live walkthroughs vary by presenter. Branching paths get lost. Persona-specific stories live in separate decks.',
  },
  {
    icon: AlertTriangle,
    title: 'Knowledge stays trapped in individuals',
    copy: 'Your best demo never becomes a reusable asset. Onboarding, sales, and support all start from scratch.',
  },
];

export const ProblemSection = () => (
  <LandingSectionShell
    tone="muted"
    eyebrow="The problem"
    title="Product teams lose hours explaining the same workflows"
    description="Manual screenshots, scattered Loom videos, and one-off slide decks cannot keep up with how fast your product moves."
  >
    <div className="grid gap-5 md:grid-cols-3">
      {PAINS.map((pain, index) => {
        const Icon = pain.icon;
        return (
          <motion.article
            key={pain.title}
            initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.35 }}
            transition={{ delay: index * 0.08 }}
            className="rounded-2xl border border-slate-200 bg-slate-50 p-6"
          >
            <span className="inline-flex rounded-xl bg-red-50 p-2.5 text-red-600 ring-1 ring-red-100">
              <Icon className="h-5 w-5" aria-hidden />
            </span>
            <h3 className="mt-4 text-lg font-semibold text-slate-900">{pain.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">{pain.copy}</p>
          </motion.article>
        );
      })}
    </div>

    <motion.p
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      className="mt-10 rounded-2xl border border-amber-200 bg-amber-50 px-6 py-4 text-sm text-amber-900"
    >
      <strong className="font-semibold">The cost of waiting:</strong> slower onboarding, inconsistent
      sales narratives, and support teams answering questions that a good walkthrough would prevent.
    </motion.p>
  </LandingSectionShell>
);
