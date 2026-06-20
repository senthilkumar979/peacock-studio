import { motion } from 'framer-motion';
import { Check, Minus } from 'lucide-react';
import { LandingSectionShell } from './LandingSectionShell';
import { COMPARISON_ROWS } from './landingData';

export const ComparisonSection = () => (
  <LandingSectionShell
    tone="dark"
    eyebrow="Why Peacock Studio"
    title="Built for structured workflow capture, not generic screen recording"
    description="See how Peacock compares to manual documentation — and when it complements your existing knowledge platforms."
  >
    <div className="overflow-hidden rounded-2xl border border-white/10">
      <div className="grid grid-cols-[1.2fr_1fr_1fr] border-b border-white/10 bg-white/5 text-xs font-semibold uppercase tracking-wide text-slate-400">
        <div className="p-4">Capability</div>
        <div className="border-l border-white/10 p-4">Manual process</div>
        <div className="border-l border-white/10 p-4 text-brand-cyan">Peacock Studio</div>
      </div>

      {COMPARISON_ROWS.map((row, index) => (
        <motion.div
          key={row.label}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: index * 0.04 }}
          className="grid grid-cols-[1.2fr_1fr_1fr] border-b border-white/10 last:border-b-0"
        >
          <div className="p-4 text-sm font-medium text-white">{row.label}</div>
          <div className="flex items-start gap-2 border-l border-white/10 p-4 text-sm text-slate-400">
            <Minus className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" aria-hidden />
            <span>{row.manual}</span>
          </div>
          <div className="flex items-start gap-2 border-l border-white/10 bg-brand-cyan/5 p-4 text-sm text-slate-200">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-cyan" aria-hidden />
            <span>{row.peacock}</span>
          </div>
        </motion.div>
      ))}
    </div>
  </LandingSectionShell>
);
