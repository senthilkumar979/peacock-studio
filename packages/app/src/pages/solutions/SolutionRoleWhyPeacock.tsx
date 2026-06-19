import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import type { SolutionRole } from './solutionsData';

interface SolutionRoleWhyPeacockProps {
  role: SolutionRole;
}

export const SolutionRoleWhyPeacock = ({ role }: SolutionRoleWhyPeacockProps) => (
  <section id="why-peacock" className="landing-section-light scroll-mt-36">
    <div className="landing-section-inner">
      <motion.header
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.35 }}
        className="max-w-3xl"
      >
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-peacock-700">
          Why Peacock
        </p>
        <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          {role.whyPeacock.headline}
        </h2>
      </motion.header>

      <div className="mt-10 grid gap-5 md:grid-cols-3">
        {role.whyPeacock.differentiators.map((item, index) => (
          <motion.article
            key={item.title}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.4, delay: index * 0.06 }}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <span className="inline-flex rounded-xl bg-peacock-50 p-2.5 text-peacock-600 ring-1 ring-peacock-100">
              <Sparkles className="h-5 w-5" aria-hidden />
            </span>
            <h3 className="mt-4 text-base font-semibold text-slate-900">{item.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.description}</p>
          </motion.article>
        ))}
      </div>
    </div>
  </section>
);
