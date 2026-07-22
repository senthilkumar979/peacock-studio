import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  getLibraryGuideContent,
  type LibraryGuideId,
} from '@/constants/libraryGuideContent';

interface LibraryGuideSectionProps {
  guideId: LibraryGuideId;
  className?: string;
}

export const LibraryGuideSection = ({ guideId, className = '' }: LibraryGuideSectionProps) => {
  const content = getLibraryGuideContent(guideId);
  const Icon = content.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.35 }}
      className={`overflow-hidden rounded-2xl border border-dashed bg-gradient-to-b ${content.accent.surface} ${content.accent.ring} ring-1 ${className}`}
    >
      <div className="flex flex-col items-center px-6 pb-8 pt-10 text-center sm:px-10">
        <div
          className={`mb-5 inline-flex rounded-2xl bg-gradient-to-br ${content.accent.gradient} p-4 text-white shadow-lg shadow-slate-900/10`}
        >
          <Icon className="h-8 w-8" aria-hidden />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">{content.headline}</h2>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-slate-600">
          {content.subheadline}
        </p>
        {content.cta ? (
          <Link
            to={content.cta.href}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-peacock-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-peacock-800"
          >
            {content.cta.label}
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        ) : null}
      </div>

      <div className="grid gap-px border-t border-slate-200/80 bg-slate-200/80 sm:grid-cols-2">
        {content.benefits.map((benefit, index) => {
          const BenefitIcon = benefit.icon;
          return (
            <motion.article
              key={benefit.title}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.06 }}
              className="flex flex-col bg-white/90 p-5 text-left sm:p-6"
            >
              <span className="inline-flex w-fit rounded-lg bg-slate-50 p-2 text-peacock-600 ring-1 ring-slate-200/80">
                <BenefitIcon className="h-4 w-4" aria-hidden />
              </span>
              <h3 className="mt-3 font-semibold text-slate-900">{benefit.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{benefit.description}</p>
            </motion.article>
          );
        })}
      </div>

      <div className="border-t border-slate-200/80 bg-white/70 px-6 py-6 sm:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-peacock-700">
          {content.stepsSectionTitle}
        </p>
        <ol className="mt-4 grid gap-4 sm:grid-cols-3">
          {content.steps.map((step) => {
            const StepIcon = step.icon;
            return (
              <li key={step.step} className="flex gap-3 text-left">
                <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-peacock-50 text-xs font-bold text-peacock-700 ring-1 ring-peacock-100">
                  {step.step}
                </span>
                <div className="min-w-0">
                  <p className="flex items-center gap-1.5 font-semibold text-slate-900">
                    <StepIcon className="h-4 w-4 shrink-0 text-peacock-600" aria-hidden />
                    {step.title}
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-slate-600">{step.description}</p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </motion.div>
  );
};

interface LibraryGuideRevealProps {
  show: boolean;
  guideId: LibraryGuideId;
  className?: string;
}

export const LibraryGuideReveal = ({ show, guideId, className }: LibraryGuideRevealProps) => (
  <AnimatePresence initial={false}>
    {show ? <LibraryGuideSection guideId={guideId} className={className} /> : null}
  </AnimatePresence>
);
