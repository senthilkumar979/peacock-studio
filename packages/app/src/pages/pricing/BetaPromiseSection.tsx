import { useState, type FormEvent } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, MessageSquare } from 'lucide-react';
import { trackEvent } from '@/analytics/analyticsClient';
import { AnalyticsEvents } from '@/analytics/events';
import { openSupportChat } from '@/utils/support';
import { BETA_PERKS } from './pricingData';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const BetaPromiseSection = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!EMAIL_PATTERN.test(email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }
    // Never send the raw email as an analytics prop — just the intent signal.
    trackEvent(AnalyticsEvents.betaPricingInterest);
    setError(null);
    setSubmitted(true);
  };

  return (
    <section className="bg-slate-950 px-6 py-20 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-cyan">
            Our promise to early adopters
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight">You supported us first. We remember that.</h2>
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

        <div className="mx-auto mt-12 max-w-xl rounded-2xl border border-white/10 bg-white/5 p-6 text-center">
          {submitted ? (
            <div className="flex flex-col items-center gap-2 py-2">
              <CheckCircle2 className="h-8 w-8 text-brand-cyan" aria-hidden />
              <p className="text-base font-semibold">You're on the founding-user list.</p>
              <p className="text-sm text-slate-300">We'll reach out personally before any pricing goes live.</p>
            </div>
          ) : (
            <>
              <h3 className="text-lg font-semibold">Get notified before pricing starts</h3>
              <p className="mt-1 text-sm text-slate-300">
                No spam — just a heads-up and your founding-user offer.
              </p>
              <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3 sm:flex-row">
                <label className="sr-only" htmlFor="beta-email">
                  Email address
                </label>
                <input
                  id="beta-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="flex-1 rounded-lg border border-white/15 bg-slate-900 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-brand-cyan focus:outline-none focus:ring-2 focus:ring-brand-cyan/40"
                />
                <button
                  type="submit"
                  className="rounded-lg bg-brand-cyan px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
                >
                  Notify me
                </button>
              </form>
              {error ? <p className="mt-2 text-sm text-rose-300">{error}</p> : null}
            </>
          )}

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
};
