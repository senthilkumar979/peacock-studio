import { motion } from 'framer-motion';
import { LandingSectionShell } from './LandingSectionShell';
import { LANDING_FEATURES } from './landingData';

export const FeaturesSection = () => (
  <LandingSectionShell
    id="features"
    eyebrow="Features"
    title="Everything in the product, mapped to outcomes"
    description="Every capability below exists in Peacock Studio today — from Chrome extension capture to persona-led product tours."
  >
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {LANDING_FEATURES.map((feature, index) => {
        const Icon = feature.icon;
        return (
          <motion.article
            key={feature.name}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ y: -4 }}
            className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-lg hover:shadow-slate-200/60"
          >
            <span className="inline-flex w-fit rounded-xl bg-gradient-to-br from-peacock-50 to-brand-violet/10 p-2.5 text-peacock-700 ring-1 ring-peacock-100">
              <Icon className="h-5 w-5" aria-hidden />
            </span>
            <h3 className="mt-4 text-base font-semibold text-slate-900">{feature.name}</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">{feature.explanation}</p>
            <div className="mt-4 space-y-2 border-t border-slate-100 pt-4 text-xs">
              <p>
                <span className="font-semibold text-slate-700">Benefit: </span>
                <span className="text-slate-600">{feature.benefit}</span>
              </p>
              <p>
                <span className="font-semibold text-peacock-700">Impact: </span>
                <span className="text-slate-600">{feature.impact}</span>
              </p>
            </div>
          </motion.article>
        );
      })}
    </div>
  </LandingSectionShell>
);
