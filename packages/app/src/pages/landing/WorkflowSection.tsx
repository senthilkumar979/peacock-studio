import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { LandingSectionShell } from './LandingSectionShell';
import { WORKFLOW_STEPS } from './landingData';

export const WorkflowSection = () => (
  <LandingSectionShell
    id="workflow"
    tone="dark"
    eyebrow="Product walkthrough"
    title="From browser recording to shareable tour in three steps"
    description="The same flow your team uses inside the app — install the extension, refine in the editor, package and distribute."
  >
    <div className="relative">
      <div
        aria-hidden
        className="absolute left-0 right-0 top-1/2 hidden h-px -translate-y-1/2 bg-gradient-to-r from-transparent via-white/20 to-transparent lg:block"
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {WORKFLOW_STEPS.map((step, index) => {
          const Icon = step.icon;
          const isLast = index === WORKFLOW_STEPS.length - 1;
          return (
            <motion.article
              key={step.step}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="relative rounded-2xl border border-white/10 bg-white/5 p-6"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold tracking-widest text-brand-cyan">{step.step}</span>
                <span className="inline-flex rounded-lg bg-peacock-600/20 p-2 text-brand-cyan">
                  <Icon className="h-4 w-4" aria-hidden />
                </span>
              </div>
              <h3 className="mt-4 text-lg font-semibold text-white">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-300">{step.description}</p>
              {!isLast ? (
                <ArrowRight
                  className="absolute -right-3 top-1/2 hidden h-5 w-5 -translate-y-1/2 text-brand-cyan lg:block"
                  aria-hidden
                />
              ) : null}
            </motion.article>
          );
        })}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="mt-10 flex items-center justify-center gap-3 text-sm text-slate-400"
      >
        <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-emerald-400">Result</span>
        <span>A reusable demo your sales, success, and support teams can share immediately</span>
      </motion.div>
    </div>
  </LandingSectionShell>
);
