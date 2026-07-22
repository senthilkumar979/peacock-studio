import { BookMarked, Sparkles } from "lucide-react";
import type { FlowSection } from "@peacock/shared";

interface FlowSectionPlayerBodyProps {
  section: FlowSection;
  sectionLabel: string;
  hasDescription: boolean;
  titleClass: string;
}

export const FlowSectionPlayerBody = ({
  section,
  sectionLabel,
  hasDescription,
  titleClass,
}: FlowSectionPlayerBodyProps) => (
  <div className="flex flex-col items-center text-center">
    <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-peacock-600 to-brand-violet text-white shadow-lg shadow-peacock-600/30">
      <BookMarked className="h-8 w-8" aria-hidden />
    </span>

    <span className="mt-5 inline-flex items-center gap-1.5 rounded-full border border-brand-violet/20 bg-brand-violet/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-brand-violet">
      <Sparkles className="h-3.5 w-3.5" aria-hidden />
      {sectionLabel}
    </span>

    <h2 className={`mt-4 font-bold tracking-tight text-slate-900 ${titleClass}`}>
      {section.title}
    </h2>

    {hasDescription ? (
      <p className="mt-4 max-w-md text-base leading-relaxed text-slate-600">
        {section.description}
      </p>
    ) : (
      <p className="mt-4 text-sm italic text-slate-400">No section description yet.</p>
    )}

    <p className="mt-8 w-full border-t border-slate-200/80 pt-6 text-sm text-slate-500">
      Press{" "}
      <kbd className="rounded-md border border-slate-200 bg-white px-1.5 py-0.5 font-mono text-xs text-slate-700">
        →
      </kbd>{" "}
      or <span className="font-medium text-slate-700">Next</span> to begin this chapter.
    </p>
  </div>
);
