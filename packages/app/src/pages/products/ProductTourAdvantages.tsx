import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import { ProductFeatureImage } from './ProductFeatureImage';
import { PRODUCT_TOUR_ADVANTAGES, PRODUCT_TOUR_LEARNER_IMAGE } from './productToursData';

export const ProductTourAdvantages = () => (
  <section id="how-tours-help" className="landing-section-light scroll-mt-28">
    <div className="landing-section-inner">
      <motion.header
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.35 }}
        className="max-w-3xl"
      >
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-violet">
          The Peacock answer
        </p>
        <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          How Product Tours help
        </h2>
        <p className="mt-4 text-base leading-relaxed text-slate-600">
          Product Tours do not replace your wiki for policies — they complement it with composed,
          playable narratives built from real captured workflows.
        </p>
      </motion.header>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_1fr] lg:items-start">
        <div className="space-y-5">
          {PRODUCT_TOUR_ADVANTAGES.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.article
                key={item.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ delay: index * 0.06 }}
                className="rounded-2xl border border-brand-violet/15 bg-gradient-to-br from-white to-brand-violet/5 p-5 shadow-sm"
              >
                <div className="flex items-start gap-3">
                  <span className="inline-flex rounded-xl bg-brand-violet/10 p-2.5 text-brand-violet ring-1 ring-brand-violet/20">
                    <Icon className="h-4 w-4" aria-hidden />
                  </span>
                  <div>
                    <h3 className="text-base font-semibold text-slate-900">{item.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.whatItIs}</p>
                    <p className="mt-3 flex items-start gap-2 text-sm leading-relaxed text-brand-violet">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                      <span>{item.benefit}</span>
                    </p>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          className="lg:sticky lg:top-28"
        >
          <ProductFeatureImage
            title="Product Tour learner playback"
            imageSrc={PRODUCT_TOUR_LEARNER_IMAGE.src}
            suggestedPublicPath={PRODUCT_TOUR_LEARNER_IMAGE.publicPath}
          />
        </motion.div>
      </div>
    </div>
  </section>
);
