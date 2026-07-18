import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Calendar, FileText, Shield } from 'lucide-react';
import { AppFooter } from '@/components/AppFooter';
import { SiteNav } from '@/components/site/SiteNav';
import { LEGAL_LAST_UPDATED } from '@/constants/legal';
import { LANDING_PATH } from '@/constants/routes';
import type { LegalSection } from './legalContent';
import { getLegalSectionId } from './legalSectionId';
import { LegalSectionCard } from './LegalSectionCard';

type LegalPageVariant = 'privacy' | 'terms';

interface LegalRelatedPage {
  label: string;
  href: string;
  description: string;
}

interface LegalPageProps {
  variant: LegalPageVariant;
  title: string;
  eyebrow: string;
  intro: string;
  sections: LegalSection[];
  relatedPage: LegalRelatedPage;
}

const VARIANT_META: Record<
  LegalPageVariant,
  { icon: typeof Shield; gradient: string; accent: string }
> = {
  privacy: {
    icon: Shield,
    gradient: 'from-peacock-900/90 via-slate-950 to-slate-950',
    accent: 'text-brand-cyan',
  },
  terms: {
    icon: FileText,
    gradient: 'from-brand-violet/30 via-slate-950 to-slate-950',
    accent: 'text-peacock-300',
  },
};

export const LegalPage = ({
  variant,
  title,
  eyebrow,
  intro,
  sections,
  relatedPage,
}: LegalPageProps) => {
  const { pathname } = useLocation();
  const meta = VARIANT_META[variant];
  const Icon = meta.icon;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="landing-page flex min-h-screen flex-col">
      <SiteNav />

      <section
        className={`relative overflow-hidden border-b border-slate-800 bg-gradient-to-br ${meta.gradient} px-6 pb-16 pt-28 text-white sm:pb-20 sm:pt-32`}
      >
        <div
          className="pointer-events-none absolute -right-24 top-0 h-80 w-80 rounded-full bg-peacock-500/20 blur-3xl"
          aria-hidden
        />
        <div className="relative mx-auto max-w-7xl">
          <Link
            to={LANDING_PATH}
            className="text-sm text-white/70 transition hover:text-white"
          >
            ← Back to home
          </Link>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="mt-6 max-w-3xl"
          >
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex rounded-2xl bg-white/10 p-3 ring-1 ring-white/15">
                <Icon className="h-6 w-6" aria-hidden />
              </span>
              <p className={`text-xs font-semibold uppercase tracking-[0.2em] ${meta.accent}`}>
                {eyebrow}
              </p>
            </div>
            <h1 className="mt-5 text-4xl font-bold tracking-tight sm:text-5xl">{title}</h1>
            <p className="mt-4 text-base leading-relaxed text-slate-300 sm:text-lg">{intro}</p>
            <p className="mt-5 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium text-white/90 ring-1 ring-white/15">
              <Calendar className="h-3.5 w-3.5" aria-hidden />
              Last updated {LEGAL_LAST_UPDATED}
            </p>
          </motion.div>
        </div>
      </section>

      <main className="landing-section-muted flex-1">
        <div className="landing-section-inner">
          <div className="grid gap-10 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-12 xl:grid-cols-[17rem_minmax(0,1fr)]">
            <aside className="lg:sticky lg:top-28 lg:self-start">
              <nav
                aria-label="On this page"
                className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-200/50"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-peacock-700">
                  On this page
                </p>
                <ol className="mt-4 space-y-1">
                  {sections.map((section, index) => (
                    <li key={section.heading}>
                      <a
                        href={`#${getLegalSectionId(section.heading)}`}
                        className="block rounded-lg px-2 py-1.5 text-sm text-slate-600 transition hover:bg-peacock-50 hover:text-peacock-800"
                      >
                        <span className="mr-2 font-medium text-slate-400">{index + 1}.</span>
                        {section.heading}
                      </a>
                    </li>
                  ))}
                </ol>
              </nav>

              <Link
                to={relatedPage.href}
                className="mt-4 flex items-start gap-3 rounded-2xl border border-peacock-200/80 bg-peacock-50/60 p-4 transition hover:border-peacock-300 hover:bg-peacock-50"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-peacock-700">
                    Also read
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">{relatedPage.label}</p>
                  <p className="mt-1 text-xs leading-relaxed text-slate-600">
                    {relatedPage.description}
                  </p>
                </div>
                <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-peacock-700" aria-hidden />
              </Link>
            </aside>

            <div className="space-y-5">
              {sections.map((section, index) => (
                <LegalSectionCard key={section.heading} section={section} index={index} />
              ))}
            </div>
          </div>
        </div>
      </main>

      <AppFooter />
    </div>
  );
};
