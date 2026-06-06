import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { LandingSectionShell } from './LandingSectionShell';
import { AUTOMATION_ITEMS } from './landingData';

export const AutomationSection = () => (
  <LandingSectionShell
    tone="muted"
    eyebrow="Smart defaults"
    title="Less manual work built into every capture"
    description="Peacock Studio does not use AI today. Instead, deterministic automation and privacy guardrails reduce repetitive setup from the moment you hit record."
  >
    <div className="grid gap-4 sm:grid-cols-2">
      {AUTOMATION_ITEMS.map((item, index) => (
        <motion.article
          key={item.title}
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: index * 0.06 }}
          className="flex gap-4 rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-5"
        >
          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-peacock-100 text-peacock-700">
            <Sparkles className="h-4 w-4" aria-hidden />
          </span>
          <div>
            <h3 className="text-sm font-semibold text-slate-900">{item.title}</h3>
            <p className="mt-1 text-sm leading-relaxed text-slate-600">{item.copy}</p>
          </div>
        </motion.article>
      ))}
    </div>
  </LandingSectionShell>
);
