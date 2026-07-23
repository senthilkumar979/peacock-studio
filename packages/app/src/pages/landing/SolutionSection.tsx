import { motion } from 'framer-motion';
import { ArrowRight, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { LandingSectionShell } from './LandingSectionShell';
import { LANDING_TWO_FORMATS } from './landingData';

const BEFORE = [
  'Screenshot each step into a doc',
  'Record separate videos per path',
  'Rebuild decks for each persona',
  'No single source of truth',
];

const AFTER = [
  'Record the workflow once in Chrome',
  'Publish Flow Documents for execution and reference',
  'Compose Product Tours for adoption and storytelling',
  'Share links or export PDFs from the same library',
];

export const SolutionSection = () => (
  <LandingSectionShell
    id="solution"
    tone="dark"
    eyebrow="The solution"
    title="One capture pipeline. Two formats your teams need."
    description="Peacock Studio connects extension recording, structured editing, and guided playback — producing execution-grade Flow Documents and adoption-focused Product Tours from the same library."
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

    <div className="mt-8 grid gap-4 sm:grid-cols-2">
      {LANDING_TWO_FORMATS.map((format, index) => (
        <motion.article
          key={format.title}
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: index * 0.08 }}
          className="rounded-2xl border border-white/10 bg-white/5 p-5"
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-cyan">
            {format.subtitle}
          </p>
          <h3 className="mt-2 text-base font-semibold text-white">{format.title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-300">{format.copy}</p>
        </motion.article>
      ))}
    </div>

    <div className="mt-10 text-center">
      <Link
        to="/solutions"
        className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-peacock-800 shadow-lg transition hover:bg-slate-100"
      >
        Explore solutions by role
        <ArrowRight className="h-4 w-4" aria-hidden />
      </Link>
    </div>
  </LandingSectionShell>
);
