import type { LegalSection } from './legalContent';
import { getLegalSectionId } from './legalSectionId';

interface LegalSectionCardProps {
  section: LegalSection;
  index: number;
}

export const LegalSectionCard = ({ section, index }: LegalSectionCardProps) => {
  const sectionId = getLegalSectionId(section.heading);

  return (
    <section
      id={sectionId}
      className="scroll-mt-28 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm shadow-slate-200/50 sm:p-8"
    >
      <div className="flex items-start gap-4">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-peacock-50 text-sm font-bold text-peacock-800 ring-1 ring-peacock-100">
          {index + 1}
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-semibold tracking-tight text-slate-900 sm:text-xl">
            {section.heading}
          </h2>
          {section.paragraphs?.map((paragraph) => (
            <p key={paragraph} className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base">
              {paragraph}
            </p>
          ))}
          {section.bullets ? (
            <ul className="mt-3 space-y-2 pl-1 text-sm leading-relaxed text-slate-600 sm:text-base">
              {section.bullets.map((bullet) => (
                <li key={bullet} className="flex gap-2.5">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-peacock-500" aria-hidden />
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </section>
  );
};
