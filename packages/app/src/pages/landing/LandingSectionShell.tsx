import type { ReactNode } from "react";
import { motion } from "framer-motion";

type LandingSectionTone = "light" | "muted" | "dark";

interface LandingSectionShellProps {
  id?: string;
  eyebrow: string;
  title: string;
  description?: string;
  children: ReactNode;
  tone?: LandingSectionTone;
}

const TONE_CLASS: Record<LandingSectionTone, string> = {
  light: "landing-section-light",
  muted: "landing-section-muted",
  dark: "landing-section-dark",
};

const EYEBROW_CLASS: Record<LandingSectionTone, string> = {
  light: "text-peacock-700",
  muted: "text-peacock-700",
  dark: "text-brand-cyan",
};

const DESCRIPTION_CLASS: Record<LandingSectionTone, string> = {
  light: "text-slate-600",
  muted: "text-slate-600",
  dark: "text-slate-300",
};

export const LandingSectionShell = ({
  id,
  eyebrow,
  title,
  description,
  children,
  tone = "light",
}: LandingSectionShellProps) => (
  <section id={id} className={TONE_CLASS[tone]}>
    <div className="landing-section-inner">
      <motion.header
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.35 }}
        transition={{ duration: 0.4 }}
        className="landing-section-header"
      >
        <p
          className={`text-xs font-semibold uppercase tracking-[0.16em] ${EYEBROW_CLASS[tone]}`}
        >
          {eyebrow}
        </p>
        {title && (
          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            {title}
          </h2>
        )}
        {description ? (
          <p
            className={`mt-4 text-base leading-relaxed ${DESCRIPTION_CLASS[tone]}`}
          >
            {description}
          </p>
        ) : null}
      </motion.header>
      <div className="landing-section-body">{children}</div>
    </div>
  </section>
);
