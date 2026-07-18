import { AppFooter } from '@/components/AppFooter';
import { SiteNav } from '@/components/site/SiteNav';
import { LEGAL_LAST_UPDATED } from '@/constants/legal';
import type { LegalSection } from './legalContent';

interface LegalPageProps {
  title: string;
  intro: string;
  sections: LegalSection[];
}

export const LegalPage = ({ title, intro, sections }: LegalPageProps) => (
  <div className="landing-page min-h-screen">
    <SiteNav />

    <main className="mx-auto max-w-3xl px-6 pb-20 pt-28 sm:pt-32">
      <header className="border-b border-slate-200 pb-6">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          {title}
        </h1>
        <p className="mt-2 text-sm text-slate-500">Last updated: {LEGAL_LAST_UPDATED}</p>
        <p className="mt-4 text-base leading-relaxed text-slate-600">{intro}</p>
      </header>

      <div className="mt-8 space-y-8">
        {sections.map((section) => (
          <section key={section.heading}>
            <h2 className="text-lg font-semibold text-slate-900">{section.heading}</h2>
            {section.paragraphs?.map((paragraph) => (
              <p key={paragraph} className="mt-2 text-sm leading-relaxed text-slate-600">
                {paragraph}
              </p>
            ))}
            {section.bullets ? (
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-relaxed text-slate-600">
                {section.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            ) : null}
          </section>
        ))}
      </div>
    </main>

    <AppFooter />
  </div>
);
