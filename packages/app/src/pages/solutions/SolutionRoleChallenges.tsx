import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import type { SolutionRole } from './solutionsData';

interface SolutionRoleChallengesProps {
  role: SolutionRole;
}

export const SolutionRoleChallenges = ({ role }: SolutionRoleChallengesProps) => (
  <section id="challenges" className="landing-section-light scroll-mt-36">
    <div className="landing-section-inner">
      <div className="grid gap-12 lg:grid-cols-[minmax(0,22rem)_1fr] lg:items-start">
        <motion.header
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.4 }}
          className="lg:sticky lg:top-36"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-peacock-700">
            Challenges
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            What gets in the way today
          </h2>
          <p className="mt-4 text-base leading-relaxed text-slate-600">
            Common friction points for {role.shortTitle.toLowerCase()} — and where Peacock
            replaces scattered docs, one-off recordings, and repeat walkthroughs.
          </p>
          <p className="mt-6 rounded-2xl border border-peacock-200 bg-peacock-50 px-4 py-3 text-sm leading-relaxed text-peacock-900">
            <strong className="font-semibold">Peacock&apos;s answer:</strong> capture once, share
            structured flow docs for execution, and compose product tours for adoption.
          </p>
        </motion.header>

        <ul className="space-y-4">
          {role.primaryChallenges.map((challenge, index) => (
            <motion.li
              key={challenge.title}
              initial={{ opacity: 0, x: 16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.4, delay: index * 0.06 }}
              className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-slate-300 hover:shadow-md"
            >
              <div
                className={`absolute inset-y-0 left-0 w-1 bg-gradient-to-b ${role.accentGradient} opacity-80`}
                aria-hidden
              />
              <div className="flex items-start gap-4 pl-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-sm font-bold text-red-600 ring-1 ring-red-100">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start gap-2">
                    <AlertTriangle
                      className="mt-0.5 h-4 w-4 shrink-0 text-amber-500 opacity-0 transition group-hover:opacity-100"
                      aria-hidden
                    />
                    <p className="text-base font-semibold text-slate-900">{challenge.title}</p>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-slate-600">
                    {challenge.description}
                  </p>
                </div>
              </div>
            </motion.li>
          ))}
        </ul>
      </div>
    </div>
  </section>
);
