import { motion } from 'framer-motion';
import { MessageSquare } from 'lucide-react';
import { openSupportChat } from '@/utils/support';
import { BETA_PERKS } from './pricingData';

export const BetaPromiseSection = () => (
  <section className="bg-slate-950 px-6 py-20 text-white">
    <div className="mx-auto max-w-6xl">
      <div className="text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-cyan">
          Our promise to early adopters
        </p>
        <h2 className="mt-3 text-3xl font-bold tracking-tight">
          You supported us first. We remember that.
        </h2>
      </div>

      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {BETA_PERKS.map((perk, index) => {
          const Icon = perk.icon;
          return (
            <motion.article
              key={perk.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.06 }}
              className="rounded-2xl border border-white/10 bg-white/5 p-5"
            >
              <span className="inline-flex rounded-xl bg-brand-cyan/20 p-2.5 text-brand-cyan">
                <Icon className="h-5 w-5" aria-hidden />
              </span>
              <h3 className="mt-4 text-base font-semibold text-white">{perk.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-300">{perk.description}</p>
            </motion.article>
          );
        })}
      </div>

      <div className="mx-auto mt-12 max-w-xl text-center">
        <p className="text-sm leading-relaxed text-slate-300">
          When paid plans launch, early adopters keep founding-user pricing below our standard rates.
        </p>
        <button
          type="button"
          onClick={openSupportChat}
          className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-brand-cyan transition hover:text-cyan-300"
        >
          <MessageSquare className="h-4 w-4" aria-hidden />
          Share beta feedback — it shapes the product
        </button>
      </div>
    </div>
  </section>
);
