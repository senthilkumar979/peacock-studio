import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import type { LandingWorkflowStep } from './landingData';

interface WorkflowStepCardProps {
  step: LandingWorkflowStep;
  index: number;
  isLast: boolean;
}

export const WorkflowStepCard = ({ step, index, isLast }: WorkflowStepCardProps) => {
  const Icon = step.icon;

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      className="group relative flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-sm transition hover:border-brand-cyan/25 hover:bg-white/[0.07] sm:p-7"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-brand-cyan/10 blur-3xl transition group-hover:bg-brand-cyan/20"
      />

      <div className="relative flex items-start justify-between gap-4">
        <div>
          <p className="text-[0.65rem] font-bold tracking-[0.22em] text-brand-cyan">{step.step}</p>
          <h3 className="mt-2 text-xl font-semibold text-white">{step.title}</h3>
        </div>
        <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-peacock-500/30 to-brand-violet/20 text-brand-cyan ring-1 ring-white/10">
          <Icon className="h-5 w-5" aria-hidden />
        </span>
      </div>

      <p className="relative mt-4 text-sm leading-relaxed text-slate-300">{step.description}</p>

      <ul className="relative mt-5 space-y-2.5 border-t border-white/10 pt-5">
        {step.deliverables.map((item) => (
          <li key={item} className="flex items-start gap-2.5 text-sm text-slate-300">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-cyan" aria-hidden />
            <span>{item}</span>
          </li>
        ))}
      </ul>

      <p className="relative mt-auto pt-5 text-xs font-medium leading-relaxed text-emerald-200">
        <span className="mb-1 block text-[0.65rem] font-bold uppercase tracking-[0.16em] text-emerald-400/90">
          Stage outcome
        </span>
        {step.outcome}
      </p>

      {!isLast ? (
        <span
          aria-hidden
          className="absolute -right-3 top-1/2 hidden h-2 w-2 rounded-full bg-brand-cyan lg:block"
        />
      ) : null}
    </motion.article>
  );
};
