import { motion } from "framer-motion";
import {
  Film,
  FolderTree,
  Layers3Icon,
  PlayCircleIcon,
  Route,
} from "lucide-react";
import { ProductFeatureImage } from "./ProductFeatureImage";
import {
  CREDIT_CARD_TOUR_EXAMPLE,
  PRODUCT_TOUR_STRUCTURE_IMAGE,
} from "./productToursData";

export const ProductTourStructureExample = () => (
  <section id="tour-structure" className="landing-section-dark scroll-mt-28">
    <div className="landing-section-inner">
      <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-cyan">
            Tour anatomy
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            One tour, many features, many demos
          </h2>
          <p className="mt-4 text-base leading-relaxed text-slate-300">
            {CREDIT_CARD_TOUR_EXAMPLE.tourDescription}
          </p>

          <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm sm:p-6">
            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
              <span className="inline-flex rounded-xl bg-brand-violet/20 p-2.5 text-brand-cyan ring-1 ring-brand-violet/30">
                <Route className="h-5 w-5" aria-hidden />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                  Tour Overview
                </p>
                <p className="text-lg font-semibold text-white">
                  {CREDIT_CARD_TOUR_EXAMPLE.tourTitle}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <p className="mt-1 text-sm leading-relaxed bg-white/10 rounded-xl px-2 py-1 w-fit text-slate-400 flex items-center gap-2">
                    <Layers3Icon className="h-4 w-4" aria-hidden /> 3 features
                  </p>
                  <p className="mt-1 text-sm leading-relaxed bg-white/10 rounded-xl px-2 py-1 w-fit text-slate-400 flex items-center gap-2">
                    <PlayCircleIcon className="h-4 w-4" aria-hidden /> 8 demos
                  </p>
                </div>
              </div>
            </div>

            <ul className="mt-5 space-y-5">
              {CREDIT_CARD_TOUR_EXAMPLE.features.map(
                (feature, featureIndex) => (
                  <li key={feature.title}>
                    <div className="flex items-start gap-5">
                      <span className="mt-0.5 inline-flex rounded-lg bg-white/10 p-2 text-brand-cyan ring-1 ring-white/10">
                        <FolderTree className="h-4 w-4" aria-hidden />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-white">
                          {feature.title}
                        </p>
                        <ul className="mt-5 space-y-5 border-l border-white/10 pl-4">
                          {feature.demos.map((demo) => (
                            <li
                              key={demo}
                              className="flex items-start gap-2 text-sm leading-relaxed text-slate-300"
                            >
                              <Film
                                className="mt-1 h-3.5 w-3.5 shrink-0 text-slate-500"
                                aria-hidden
                              />
                              <span>
                                <span className="font-medium text-slate-200">
                                  Demo:{" "}
                                </span>
                                {demo}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    {featureIndex <
                    CREDIT_CARD_TOUR_EXAMPLE.features.length - 1 ? (
                      <div className="ml-5 mt-8 h-px bg-white/10" aria-hidden />
                    ) : null}
                  </li>
                ),
              )}
            </ul>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-slate-400">
            Each demo links to a saved flow document — a recorded scenario your
            team captures once and reuses across tours, training, and release
            reviews.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ delay: 0.08 }}
        >
          <ProductFeatureImage
            title="Product Tour builder structure"
            imageSrc={PRODUCT_TOUR_STRUCTURE_IMAGE.src}
            suggestedPublicPath={PRODUCT_TOUR_STRUCTURE_IMAGE.publicPath}
            variant="dark"
            isFullHeight={true}
          />
        </motion.div>
      </div>
    </div>
  </section>
);
