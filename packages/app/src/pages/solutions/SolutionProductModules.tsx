import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2, FileText, Route } from 'lucide-react';
import type { SolutionBenefit, SolutionRole } from './solutionsData';

interface SolutionProductModuleProps {
  role: SolutionRole;
}

const BenefitList = ({
  benefits,
  accentClass,
  ringClass,
}: {
  benefits: SolutionBenefit[];
  accentClass: string;
  ringClass: string;
}) => (
  <ul className="mt-6 space-y-3">
    {benefits.map((benefit, index) => (
      <motion.li
        key={benefit.title}
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.35, delay: index * 0.05 }}
        className={`rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm ${ringClass}`}
      >
        <div className="flex items-start gap-3">
          <CheckCircle2 className={`mt-0.5 h-4 w-4 shrink-0 ${accentClass}`} aria-hidden />
          <div>
            <p className={`text-sm font-semibold ${accentClass}`}>{benefit.title}</p>
            <p className="mt-1 text-sm leading-relaxed text-slate-600">{benefit.description}</p>
          </div>
        </div>
      </motion.li>
    ))}
  </ul>
);

export const SolutionProductModules = ({ role }: SolutionProductModuleProps) => (
  <section id="capabilities" className="landing-section-muted scroll-mt-36">
    <div className="landing-section-inner">
      <motion.header
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.35 }}
        className="landing-section-header"
      >
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-peacock-700">
          Peacock capabilities
        </p>
        <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          How Peacock helps {role.shortTitle.toLowerCase()}
        </h2>
        <p className="mt-4 text-base leading-relaxed text-slate-600">
          Flow Documents are execution references. Product Tours are adoption
          narratives — two formats from one capture, tailored for{' '}
          {role.shortTitle.toLowerCase()}.
        </p>
      </motion.header>

      <div className="mt-12 grid gap-8 lg:grid-cols-2">
        <article className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-8 shadow-lg shadow-slate-200/50">
          <div
            className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-peacock-100/80 blur-2xl"
            aria-hidden
          />
          <div className="relative flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-peacock-50 text-peacock-700 ring-1 ring-peacock-100">
              <FileText className="h-6 w-6" aria-hidden />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-peacock-600">
                Flow Documents
              </p>
              <h3 className="text-xl font-bold text-slate-900">{role.flowDocuments.headline}</h3>
            </div>
          </div>
          <p className="relative mt-4 text-sm leading-relaxed text-slate-600">
            {role.flowDocuments.description}
          </p>
          <BenefitList
            benefits={role.flowDocuments.benefits}
            accentClass="text-peacock-800"
            ringClass="hover:ring-1 hover:ring-peacock-100"
          />
          <Link
            to="/editor"
            className="relative mt-6 inline-flex items-center gap-2 rounded-lg bg-peacock-50 px-4 py-2.5 text-sm font-semibold text-peacock-800 transition hover:bg-peacock-100"
          >
            Start a flow document
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </article>

        <article className="relative overflow-hidden rounded-3xl border border-brand-violet/20 bg-gradient-to-br from-white via-white to-brand-violet/5 p-8 shadow-lg shadow-brand-violet/10">
          <div
            className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-brand-violet/10 blur-2xl"
            aria-hidden
          />
          <div className="relative flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-violet/10 text-brand-violet ring-1 ring-brand-violet/20">
              <Route className="h-6 w-6" aria-hidden />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-brand-violet">
                Product Tours
              </p>
              <h3 className="text-xl font-bold text-slate-900">{role.productTours.headline}</h3>
            </div>
          </div>
          <p className="relative mt-4 text-sm leading-relaxed text-slate-600">
            {role.productTours.description}
          </p>
          <BenefitList
            benefits={role.productTours.benefits}
            accentClass="text-brand-violet"
            ringClass="hover:ring-1 hover:ring-brand-violet/20"
          />
          <Link
            to="/tours/new"
            className="relative mt-6 inline-flex items-center gap-2 rounded-lg bg-brand-violet/10 px-4 py-2.5 text-sm font-semibold text-brand-violet transition hover:bg-brand-violet/15"
          >
            Create a product tour
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </article>
      </div>
    </div>
  </section>
);
