import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { trackEvent } from '@/analytics/analyticsClient';
import { AnalyticsEvents } from '@/analytics/events';
import { AppFooter } from '@/components/AppFooter';
import { SiteNav } from '@/components/site/SiteNav';
import { DASHBOARD_PATH } from '@/constants/routes';
import { BetaPromiseSection } from '@/pages/pricing/BetaPromiseSection';
import { PricingTiersPreview } from '@/pages/pricing/PricingTiersPreview';
import { BETA_HERO } from '@/pages/pricing/pricingData';
import { getExtensionGatePath } from '@/utils/extensionGate';

function trackPricingInterest(surface: string): void {
  trackEvent(AnalyticsEvents.betaPricingInterest, { surface });
}

export const Pricing = () => {
  const EyebrowIcon = BETA_HERO.eyebrowIcon;

  return (
    <div className="landing-page min-h-screen">
      <SiteNav />

      <section className="relative overflow-hidden border-b border-slate-800 bg-slate-950 px-6 pb-24 pt-28 text-white sm:pt-32">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 left-1/2 h-72 w-[36rem] -translate-x-1/2 rounded-full bg-brand-cyan/20 blur-3xl"
        />
        <div className="relative mx-auto max-w-3xl text-center">
          <motion.span
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 rounded-full border border-brand-cyan/40 bg-brand-cyan/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-brand-cyan"
          >
            <EyebrowIcon className="h-3.5 w-3.5" aria-hidden />
            {BETA_HERO.badge}
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl"
          >
            {BETA_HERO.title}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-slate-300"
          >
            {BETA_HERO.subtitle}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-3"
          >
            <Link
              to={getExtensionGatePath(DASHBOARD_PATH)}
              onClick={() => trackPricingInterest('pricing_hero_start_free')}
              className="inline-flex items-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-peacock-800 shadow-sm transition hover:bg-slate-100"
            >
              Start using Peacock free
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <a
              href="#beta-promise"
              onClick={() => trackPricingInterest('pricing_hero_early_adopter')}
              className="rounded-lg border border-white/20 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Early-adopter promise
            </a>
          </motion.div>
        </div>
      </section>

      <PricingTiersPreview />

      <div id="beta-promise">
        <BetaPromiseSection />
      </div>

      <AppFooter />
    </div>
  );
};
