import { motion } from 'framer-motion';
import { TRADITIONAL_DOC_GAPS } from './productToursData';

export const ProductTourTraditionalGap = () => (
  <section id="traditional-gaps" className="landing-section-muted scroll-mt-28">
    <div className="landing-section-inner">
      <motion.header
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.35 }}
        className="max-w-3xl"
      >
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-violet">
          The gap
        </p>
        <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          What traditional documents miss
        </h2>
        <p className="mt-4 text-base leading-relaxed text-slate-600">
          Confluence, SharePoint, Word, and similar tools excel at policy pages and long-form
          reference — but complex products with many features and scenarios need more than static
          attachments and nested folders.
        </p>
      </motion.header>

      <div className="mt-10 grid gap-5 sm:grid-cols-2">
        {TRADITIONAL_DOC_GAPS.map((gap, index) => {
          const Icon = gap.icon;
          return (
            <motion.article
              key={gap.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ delay: index * 0.05 }}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <span className="inline-flex rounded-xl bg-slate-100 p-2.5 text-slate-600 ring-1 ring-slate-200">
                <Icon className="h-5 w-5" aria-hidden />
              </span>
              <h3 className="mt-4 text-lg font-semibold text-slate-900">{gap.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{gap.description}</p>
            </motion.article>
          );
        })}
      </div>
    </div>
  </section>
);
