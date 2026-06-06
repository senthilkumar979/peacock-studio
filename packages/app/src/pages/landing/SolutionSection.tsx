import { motion } from 'framer-motion';
import { ArrowRight, X } from 'lucide-react';
import { LandingSectionShell } from './LandingSectionShell';

const BEFORE = [
  'Screenshot each step into a doc',
  'Record separate videos per path',
  'Rebuild decks for each persona',
  'No single source of truth',
];

const AFTER = [
  'Record the workflow once in Chrome',
  'Edit steps, sections, and branches in one place',
  'Bundle demos into persona-led product tours',
  'Share links or export PDFs from the same asset',
];

export const SolutionSection = () => (
  <LandingSectionShell
    tone="dark"
    eyebrow="The solution"
    title="One capture pipeline. Every format your team needs."
    description="Peacock Studio connects extension recording, structured editing, interactive playback, and tour packaging into a single local-first workflow."
  >
    <div className="grid gap-6 lg:grid-cols-2">
      <motion.article
        initial={{ opacity: 0, x: -16 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        className="rounded-2xl border border-white/10 bg-white/5 p-6"
      >
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Before</p>
        <ul className="mt-4 space-y-3">
          {BEFORE.map((item) => (
            <li key={item} className="flex items-start gap-3 text-sm text-slate-400">
              <X className="mt-0.5 h-4 w-4 shrink-0 text-red-400" aria-hidden />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </motion.article>

      <motion.article
        initial={{ opacity: 0, x: 16 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        className="rounded-2xl border border-brand-cyan/30 bg-gradient-to-br from-peacock-900/50 to-brand-violet/20 p-6"
      >
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-cyan">With Peacock Studio</p>
        <ul className="mt-4 space-y-3">
          {AFTER.map((item) => (
            <li key={item} className="flex items-start gap-3 text-sm text-slate-200">
              <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-brand-cyan" aria-hidden />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </motion.article>
    </div>
  </LandingSectionShell>
);
