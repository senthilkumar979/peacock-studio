import { motion } from 'framer-motion';
import { LandingSectionShell } from './LandingSectionShell';
import { ARCHITECTURE_POINTS } from './landingData';

export const TrustArchitectureSection = () => (
  <LandingSectionShell
    id="trust"
    tone="light"
    eyebrow="Architecture & trust"
    title="Built for speed, structure, and privacy on device"
    description="Peacock is local-first by design today — structured action data, not video files, stored in your browser until you choose to share."
  >
    <div className="grid gap-5 sm:grid-cols-2">
      {ARCHITECTURE_POINTS.map((point, index) => {
        const Icon = point.icon;
        return (
          <motion.article
            key={point.title}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ delay: index * 0.06 }}
            className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-peacock-50 text-peacock-700 ring-1 ring-peacock-100">
              <Icon className="h-4 w-4" aria-hidden />
            </span>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">{point.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-slate-600">{point.copy}</p>
            </div>
          </motion.article>
        );
      })}
    </div>
  </LandingSectionShell>
);
