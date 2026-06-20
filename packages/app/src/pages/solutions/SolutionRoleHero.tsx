import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileText, Route, Check } from 'lucide-react';
import type { SolutionRole } from './solutionsData';

interface SolutionRoleHeroProps {
  role: SolutionRole;
}

export const SolutionRoleHero = ({ role }: SolutionRoleHeroProps) => {
  const Icon = role.icon;

  return (
    <section className="relative overflow-hidden border-b border-slate-800 bg-slate-950 px-6 pb-20 pt-28 text-white sm:pb-24 sm:pt-32">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-peacock-900/60 via-slate-950 to-slate-950"
        aria-hidden
      />
      <div
        className={`pointer-events-none absolute -right-24 top-0 h-[28rem] w-[28rem] rounded-full bg-gradient-to-br ${role.accentGradient} opacity-20 blur-3xl`}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -left-32 bottom-0 h-72 w-72 rounded-full bg-brand-cyan/10 blur-3xl"
        aria-hidden
      />

      <div className="relative mx-auto max-w-7xl">
        <nav className="text-sm text-slate-400" aria-label="Breadcrumb">
          <Link to="/solutions" className="transition hover:text-white">
            Solutions
          </Link>
          <span className="mx-2 text-slate-600" aria-hidden>
            /
          </span>
          <span className="font-medium text-slate-200">{role.shortTitle}</span>
        </nav>

        <div className="mt-10 grid gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex flex-wrap items-center gap-3">
              <span
                className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${role.accentGradient} text-white shadow-lg shadow-black/30`}
              >
                <Icon className="h-6 w-6" aria-hidden />
              </span>
              <span className="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-brand-cyan">
                Solution for {role.shortTitle}
              </span>
            </div>

            <h1 className="mt-8 text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl lg:text-[3.25rem]">
              {role.title}
            </h1>
            <p
              className={`mt-5 max-w-2xl bg-gradient-to-r bg-clip-text text-xl font-medium text-transparent sm:text-2xl ${role.accentGradient}`}
            >
              {role.tagline}
            </p>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">
              {role.summary}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/editor"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-peacock-800 shadow-lg shadow-black/20 transition hover:bg-slate-100"
              >
                <FileText className="h-4 w-4" aria-hidden />
                Capture a flow
              </Link>
              <Link
                to="/tours/new"
                className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/15"
              >
                <Route className="h-4 w-4" aria-hidden />
                Build a product tour
              </Link>
            </div>
          </motion.div>

          <motion.aside
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.12 }}
            className="space-y-5"
          >
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-cyan">
                Who they are
              </p>
              <p className="mt-4 text-sm leading-relaxed text-slate-200">{role.whoTheyAre}</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-cyan">
                Peacock is the right fit when
              </p>
              <ul className="mt-4 space-y-3">
                {role.bestFitWhen.map((signal) => (
                  <li key={signal} className="flex items-start gap-2.5 text-sm leading-relaxed text-slate-200">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-cyan" aria-hidden />
                    <span>{signal}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.aside>
        </div>
      </div>
    </section>
  );
};
