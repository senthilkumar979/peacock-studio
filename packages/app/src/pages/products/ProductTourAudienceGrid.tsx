import { motion } from 'framer-motion';
import { PRODUCT_TOUR_AUDIENCES } from './productToursData';

export const ProductTourAudienceGrid = () => (
  <section id="who-benefits" className="landing-section-muted scroll-mt-28">
    <div className="landing-section-inner">
      <motion.header
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.35 }}
        className="max-w-3xl"
      >
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-violet">
          Across the company
        </p>
        <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Who Product Tours help
        </h2>
        <p className="mt-4 text-base leading-relaxed text-slate-600">
          One capture pipeline feeds multiple teams — each uses tours for a different outcome, from
          onboarding to customer demos to release verification.
        </p>
      </motion.header>

      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {PRODUCT_TOUR_AUDIENCES.map((audience, index) => {
          const Icon = audience.icon;
          return (
            <motion.article
              key={audience.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ delay: index * 0.05 }}
              className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-brand-violet/25 hover:shadow-md"
            >
              <span className="inline-flex w-fit rounded-xl bg-brand-violet/10 p-2.5 text-brand-violet ring-1 ring-brand-violet/20">
                <Icon className="h-5 w-5" aria-hidden />
              </span>
              <p className="mt-4 text-xs font-semibold uppercase tracking-[0.14em] text-brand-violet">
                {audience.role}
              </p>
              <h3 className="mt-2 text-lg font-semibold text-slate-900">{audience.title}</h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">
                {audience.description}
              </p>
            </motion.article>
          );
        })}
      </div>
    </div>
  </section>
);
