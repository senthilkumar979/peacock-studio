import { BookMarked, Sparkles } from "lucide-react";
import type { FlowSection } from "@peacock/shared";
import { FlowSectionPlayerBody } from "@/components/FlowSectionPlayerBody";

export type FlowSectionCardVariant = "document" | "player" | "editor";

interface FlowSectionCardProps {
  section: FlowSection;
  variant?: FlowSectionCardVariant;
  anchorId?: string;
  isActive?: boolean;
  sectionIndex?: number;
}

const variantStyles: Record<
  FlowSectionCardVariant,
  { shell: string; title: string; padding: string }
> = {
  document: {
    shell: "scroll-mt-24",
    title: "text-2xl sm:text-3xl",
    padding: "px-6 py-9 sm:px-8 sm:py-10",
  },
  player: {
    shell: "mx-auto w-full max-w-xl",
    title: "text-2xl sm:text-3xl",
    padding: "px-8 py-10 sm:px-10 sm:py-12",
  },
  editor: {
    shell: "max-w-lg w-full",
    title: "text-2xl",
    padding: "px-6 py-8",
  },
};

export const FlowSectionCard = ({
  section,
  variant = "document",
  anchorId,
  isActive = false,
  sectionIndex,
}: FlowSectionCardProps) => {
  const styles = variantStyles[variant];
  const hasDescription = Boolean(section.description.trim());
  const sectionLabel =
    sectionIndex !== undefined ? `Chapter ${sectionIndex + 1}` : "Chapter";

  if (variant === "player") {
    return (
      <article
        id={anchorId}
        className={`relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-xl shadow-slate-200/50 ${styles.shell}`}
      >
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-brand-violet/10 via-peacock-50/60 to-transparent"
          aria-hidden
        />
        <div className={`relative ${styles.padding}`}>
          <FlowSectionPlayerBody
            section={section}
            sectionLabel={sectionLabel}
            hasDescription={hasDescription}
            titleClass={styles.title}
          />
        </div>
      </article>
    );
  }

  return (
    <article
      id={anchorId}
      className={`relative overflow-hidden rounded-3xl border shadow-lg transition duration-300 ${styles.shell} ${
        isActive
          ? "border-brand-violet/50 shadow-brand-violet/10 ring-2 ring-brand-violet/25"
          : "border-slate-200/80 shadow-slate-200/60"
      }`}
    >
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-peacock-50/90 via-white to-brand-violet/5"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-peacock-200/30 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-20 -left-12 h-56 w-56 rounded-full bg-brand-violet/15 blur-3xl"
        aria-hidden
      />

      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-peacock-500 via-peacock-600 to-brand-violet" />

      <div className={`relative ${styles.padding}`}>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-peacock-600 to-brand-violet text-white shadow-lg shadow-peacock-600/25">
            <BookMarked className="h-7 w-7" aria-hidden />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-violet/20 bg-brand-violet/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-brand-violet">
                <Sparkles className="h-3.5 w-3.5" aria-hidden />
                {sectionLabel}
              </span>
            </div>

            <h2
              className={`mt-4 font-bold tracking-tight text-slate-900 ${styles.title}`}
            >
              {section.title}
            </h2>

            {hasDescription ? (
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
                {section.description}
              </p>
            ) : (
              <p className="mt-4 text-sm italic text-slate-400">
                No section description yet.
              </p>
            )}
          </div>
        </div>
      </div>
    </article>
  );
};
