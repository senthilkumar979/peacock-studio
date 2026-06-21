import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import { ProductFeatureImage } from './ProductFeatureImage';
import { PERSONA_TOUR_BENEFITS } from './productToursData';

export const ProductTourPersonaBenefits = () => (
  <section id="persona-tours" className="landing-section-light scroll-mt-28">
    <div className="landing-section-inner">
      <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-violet">
            Persona-led
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            {PERSONA_TOUR_BENEFITS.headline}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-slate-600">
            {PERSONA_TOUR_BENEFITS.description}
          </p>

          <ul className="mt-8 space-y-4">
            {PERSONA_TOUR_BENEFITS.points.map((point, index) => (
              <motion.li
                key={point.title}
                initial={{ opacity: 0, x: -12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ delay: index * 0.06 }}
                className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <p className="flex items-start gap-2 text-sm font-semibold text-slate-900">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-violet" aria-hidden />
                  {point.title}
                </p>
                <p className="mt-2 pl-6 text-sm leading-relaxed text-slate-600">
                  {point.description}
                </p>
              </motion.li>
            ))}
          </ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ delay: 0.1 }}
        >
          <ProductFeatureImage
            title="Persona-based product tours"
            imageSrc={PERSONA_TOUR_BENEFITS.image.src}
            suggestedPublicPath={PERSONA_TOUR_BENEFITS.image.publicPath}
          />
        </motion.div>
      </div>
    </div>
  </section>
);
