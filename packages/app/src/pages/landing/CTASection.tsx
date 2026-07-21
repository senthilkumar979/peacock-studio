import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ChromeWebStoreLink } from '@/components/extension/ChromeWebStoreLink';
import { getExtensionGatePath } from '@/utils/extensionGate';

export const CTASection = () => (
  <section className="landing-section-muted">
    <div className="landing-section-inner">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.35 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-peacock-700 via-peacock-800 to-brand-violet px-8 py-14 shadow-2xl shadow-peacock-900/30 sm:px-12"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-brand-cyan/20 blur-3xl"
        />

        <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-peacock-100">
              Start today
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Your next great demo starts with one recording
            </h2>
            <p className="mt-4 text-base leading-relaxed text-peacock-100/90">
              Install the free Chrome extension, capture a workflow, and publish a walkthrough or
              product tour your entire team can reuse — no backend setup required.
            </p>
            <ul className="mt-6 flex flex-wrap gap-3 text-sm text-white/90">
              {['Local-first storage', 'Branching demos', 'PDF & share links'].map((item) => (
                <li key={item} className="rounded-full border border-white/25 bg-white/10 px-3 py-1">
                  {item}
                </li>
              ))}
            </ul>
            <ChromeWebStoreLink className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-white/90 underline-offset-4 transition hover:text-white hover:underline" />
          </div>

          <div className="flex shrink-0 flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
            <Link
              to={getExtensionGatePath('/editor')}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-semibold text-peacock-800 shadow-lg transition hover:bg-slate-100"
            >
              Start capturing
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <Link
              to={getExtensionGatePath('/tours/new')}
              className="inline-flex items-center justify-center rounded-xl border border-white/30 bg-white/10 px-6 py-3.5 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/15"
            >
              Create product tour
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  </section>
);
