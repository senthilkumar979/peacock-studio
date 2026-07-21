import { Check } from "lucide-react";
import { motion } from "framer-motion";
import { PRICING_TIERS } from "./pricingData";

/**
 * Blurred, non-interactive preview of the future paid tiers. Communicates the
 * planned shape of pricing without committing to numbers during beta.
 */
export const PricingTiersPreview = () => (
  <section className="landing-section-light">
    <div className="landing-section-inner">
      <div className="text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-peacock-700">
          A look ahead
        </p>
        <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
          Planned plans
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-base leading-relaxed text-slate-600">
          Here's the shape of what's coming. Numbers are intentionally hidden
          while we're in beta — early adopters lock in a better rate regardless.
        </p>
      </div>

      <div className="relative mt-10">
        <div className="grid gap-6 lg:grid-cols-3">
          {PRICING_TIERS.map((tier, index) => (
            <motion.article
              key={tier.name}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.06 }}
              className={`flex h-full flex-col rounded-2xl border bg-white p-6 shadow-sm ${
                tier.highlight
                  ? "border-peacock-300 ring-2 ring-peacock-200"
                  : "border-slate-200"
              }`}
            >
              {tier.highlight ? (
                <span className="mb-3 inline-flex w-fit rounded-full bg-peacock-600 px-3 py-1 text-xs font-semibold text-white">
                  Most popular
                </span>
              ) : null}
              <h3 className="text-xl font-bold text-slate-900">{tier.name}</h3>
              <p className="mt-1 text-sm text-slate-500">{tier.audience}</p>

              <div className="mt-4 flex items-baseline gap-1">
                <span className="select-none text-3xl font-bold tracking-tight text-slate-300 blur-[6px]">
                  $00
                </span>
                <span className="text-sm text-slate-400">/ coming soon</span>
              </div>

              <ul className="mt-5 space-y-2.5">
                {tier.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-2 text-sm text-slate-600"
                  >
                    <Check
                      className="mt-0.5 h-4 w-4 shrink-0 text-peacock-600"
                      aria-hidden
                    />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </motion.article>
          ))}
        </div>

        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <span className="rounded-full border border-slate-200 bg-white/90 px-5 py-2 text-sm font-semibold text-slate-700 shadow-md backdrop-blur">
            Pricing to be announced
          </span>
        </div>
      </div>
    </div>
  </section>
);
