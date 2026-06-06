import { motion } from 'framer-motion';
import { ArrowRight, Play } from 'lucide-react';
import { Link } from 'react-router-dom';
import { HeroWorkflowVisual } from './HeroWorkflowVisual';

export const HeroSection = () => (
  <section className="relative overflow-hidden border-b border-slate-800 bg-slate-950 px-6 pb-24 pt-12 sm:pb-32 sm:pt-16">
    <motion.div
      aria-hidden
      className="pointer-events-none absolute -right-24 top-0 h-96 w-96 rounded-full bg-brand-violet/20 blur-3xl"
      animate={{ opacity: [0.3, 0.5, 0.3] }}
      transition={{ duration: 8, repeat: Infinity }}
    />
    <motion.div
      aria-hidden
      className="pointer-events-none absolute -left-24 bottom-0 h-80 w-80 rounded-full bg-brand-cyan/15 blur-3xl"
      animate={{ opacity: [0.2, 0.4, 0.2] }}
      transition={{ duration: 10, repeat: Infinity }}
    />

    <div className="relative mx-auto grid max-w-7xl gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55 }}
      >
        <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-brand-cyan">
          Browser flow recorder & demo platform
        </p>

        <h1 className="mt-6 text-4xl font-bold leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-[3.25rem]">
          Record once.
          <span className="block bg-gradient-to-r from-white via-peacock-100 to-brand-cyan bg-clip-text text-transparent">
            Ship polished product stories.
          </span>
        </h1>

        <p className="mt-6 max-w-xl text-base leading-relaxed text-slate-300 sm:text-lg">
          Peacock Studio captures real browser workflows and turns them into editable walkthroughs,
          branching demos, and persona-led product tours — stored locally, shared instantly.
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Link
            to="/editor"
            className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-semibold text-peacock-800 shadow-lg shadow-peacock-900/30 transition hover:bg-slate-100"
          >
            Start capturing
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
          <Link
            to="/tours/new"
            className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-6 py-3.5 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/10"
          >
            <Play className="h-4 w-4" aria-hidden />
            Build a product tour
          </Link>
        </div>

        <dl className="grid grid-cols-3 gap-4 border-t border-white/10 pt-8">
          {[
            ['Capture', 'Chrome extension'],
            ['Structure', 'Branches & tours'],
            ['Share', 'Links & PDF'],
          ].map(([term, detail]) => (
            <div key={term}>
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">{term}</dt>
              <dd className="mt-1 text-sm font-semibold text-white">{detail}</dd>
            </div>
          ))}
        </dl>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.15 }}
      >
        <HeroWorkflowVisual />
      </motion.div>
    </div>
  </section>
);
