import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { trackEvent } from '@/analytics/analyticsClient';
import { AnalyticsEvents } from '@/analytics/events';
import { DASHBOARD_PATH } from '@/constants/routes';
import { openSupportChat } from '@/utils/support';
import { getExtensionGatePath } from '@/utils/extensionGate';
import { PRICING_TIERS, type PricingTier } from './pricingData';

function trackPricingInterest(surface: string): void {
  trackEvent(AnalyticsEvents.betaPricingInterest, { surface });
}

function TierCta({ tier }: { tier: PricingTier }) {
  if (tier.cta === 'start-free') {
    return (
      <Link
        to={getExtensionGatePath(DASHBOARD_PATH)}
        onClick={() => trackPricingInterest(`pricing_tier_${tier.name.toLowerCase()}_start_free`)}
        className="mt-6 inline-flex w-full items-center justify-center rounded-lg bg-peacock-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-peacock-700"
      >
        Start free
      </Link>
    );
  }

  if (tier.cta === 'talk-to-us') {
    return (
      <button
        type="button"
        onClick={() => {
          trackPricingInterest(`pricing_tier_${tier.name.toLowerCase()}_talk_to_us`);
          openSupportChat();
        }}
        className="mt-6 inline-flex w-full items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
      >
        Talk to us
      </button>
    );
  }

  return null;
}

/**
 * Clear Free / Team / Enterprise comparison during beta — features and labels only,
 * no invented dollar amounts.
 */
export const PricingTiersPreview = () => (
  <section className="landing-section-light">
    <div className="landing-section-inner">
      <div className="text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-peacock-700">
          What&apos;s included
        </p>
        <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">Plans</h2>
        <p className="mx-auto mt-3 max-w-2xl text-base leading-relaxed text-slate-600">
          Everything is free during public beta. Team and Enterprise pricing will be announced
          when billing launches — early adopters keep founding-user rates.
        </p>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-3">
        {PRICING_TIERS.map((tier, index) => (
          <motion.article
            key={tier.name}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.06 }}
            className={`flex h-full flex-col rounded-2xl border bg-white p-6 shadow-sm ${
              tier.highlight
                ? 'border-peacock-300 ring-2 ring-peacock-200'
                : 'border-slate-200'
            }`}
          >
            {tier.highlight ? (
              <span className="mb-3 inline-flex w-fit rounded-full bg-peacock-600 px-3 py-1 text-xs font-semibold text-white">
                Most popular
              </span>
            ) : null}
            <h3 className="text-xl font-bold text-slate-900">{tier.name}</h3>
            <p className="mt-1 text-sm text-slate-500">{tier.audience}</p>

            <p className="mt-4 text-2xl font-bold tracking-tight text-slate-900">
              {tier.priceLabel}
            </p>

            <ul className="mt-5 flex-1 space-y-2.5">
              {tier.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-sm text-slate-600">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-peacock-600" aria-hidden />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <TierCta tier={tier} />
          </motion.article>
        ))}
      </div>
    </div>
  </section>
);
