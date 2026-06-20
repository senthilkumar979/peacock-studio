import { motion } from 'framer-motion';
import { FileText, Route, Sparkles } from 'lucide-react';
import { LandingSectionShell } from './LandingSectionShell';
import { WorkflowStepCard } from './WorkflowStepCard';
import {
  WORKFLOW_OUTPUTS,
  WORKFLOW_RESULT,
  WORKFLOW_STATS,
  WORKFLOW_STEPS,
} from './landingData';

export const WorkflowSection = () => (
  <LandingSectionShell
    id="workflow"
    tone="dark"
    eyebrow="Product walkthrough"
    title="From browser recording to shareable tour in three steps"
    description="The same end-to-end flow your team uses inside Peacock Studio — capture once, structure locally, then publish for execution and adoption."
  >
    <div className="relative">
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -right-16 top-0 h-64 w-64 rounded-full bg-brand-violet/20 blur-3xl"
        animate={{ opacity: [0.25, 0.45, 0.25] }}
        transition={{ duration: 10, repeat: Infinity }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -left-12 bottom-0 h-56 w-56 rounded-full bg-brand-cyan/15 blur-3xl"
        animate={{ opacity: [0.15, 0.35, 0.15] }}
        transition={{ duration: 12, repeat: Infinity }}
      />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="relative mb-10 grid gap-6 rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-6 sm:p-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center"
      >
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-brand-cyan">
            <Sparkles className="h-3.5 w-3.5" aria-hidden />
            End-to-end pipeline
          </div>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-slate-300 sm:text-base">
            Peacock connects extension capture, structured editing, and guided distribution in one
            local-first workflow — producing assets teams reuse across sales, enablement, support, and QA.
          </p>
        </div>

        <dl className="grid grid-cols-3 gap-3">
          {WORKFLOW_STATS.map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-4 text-center"
            >
              <dt className="text-[0.65rem] font-semibold uppercase tracking-wide text-slate-400">
                {stat.label}
              </dt>
              <dd className="mt-2 text-2xl font-bold text-white">{stat.value}</dd>
            </div>
          ))}
        </dl>
      </motion.div>

      <div className="relative">
        <div
          aria-hidden
          className="absolute left-[16.666%] right-[16.666%] top-1/2 hidden h-px -translate-y-1/2 bg-gradient-to-r from-brand-cyan/20 via-brand-cyan/50 to-brand-cyan/20 lg:block"
        />

        <div className="grid gap-6 lg:grid-cols-3">
          {WORKFLOW_STEPS.map((step, index) => (
            <WorkflowStepCard
              key={step.step}
              step={step}
              index={index}
              isLast={index === WORKFLOW_STEPS.length - 1}
            />
          ))}
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="relative mt-8 grid gap-4 md:grid-cols-2"
      >
        {WORKFLOW_OUTPUTS.map((output) => (
          <article
            key={output.title}
            className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-transparent p-5 sm:p-6"
          >
            <div className="flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-peacock-600/20 text-brand-cyan">
                {output.title === 'Flow Documents' ? (
                  <FileText className="h-4 w-4" aria-hidden />
                ) : (
                  <Route className="h-4 w-4" aria-hidden />
                )}
              </span>
              <div>
                <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-brand-cyan">
                  {output.subtitle}
                </p>
                <h4 className="mt-0.5 text-base font-semibold text-white">{output.title}</h4>
              </div>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-slate-400">{output.copy}</p>
          </article>
        ))}
      </motion.div>

      <motion.aside
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="relative mt-8 overflow-hidden rounded-[1.75rem] border border-emerald-400/20 bg-gradient-to-r from-emerald-500/10 via-white/[0.03] to-brand-violet/10 p-6 sm:p-8"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -right-10 top-0 h-32 w-32 rounded-full bg-emerald-400/10 blur-3xl"
        />
        <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <span className="inline-flex rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-300">
              {WORKFLOW_RESULT.badge}
            </span>
            <h3 className="mt-4 text-lg font-semibold text-white sm:text-xl">{WORKFLOW_RESULT.title}</h3>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-300">{WORKFLOW_RESULT.copy}</p>
          </div>
        </div>
      </motion.aside>
    </div>
  </LandingSectionShell>
);
