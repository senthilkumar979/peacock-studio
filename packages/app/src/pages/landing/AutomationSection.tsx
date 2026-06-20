import { motion } from "framer-motion";
import { ArrowRight, Cpu, ShieldCheck } from "lucide-react";
import { LandingSectionShell } from "./LandingSectionShell";
import { AutomationStagePanel } from "./AutomationStagePanel";
import {
  AUTOMATION_CATEGORIES,
  AUTOMATION_ITEMS,
  AUTOMATION_OUTCOMES,
  AUTOMATION_STATS,
} from "./landingData";

const AUTOMATION_BY_STAGE = AUTOMATION_CATEGORIES.map((category, index) => ({
  ...category,
  step: `0${index + 1}`,
  items: AUTOMATION_ITEMS.filter((item) => item.category === category.id),
}));

export const AutomationSection = () => (
  <LandingSectionShell
    tone="muted"
    eyebrow="Smart defaults"
    title="Less manual work built into every capture"
    description="Deterministic automation and privacy guardrails run across capture, library, and delivery — no AI required, no cloud dependency."
  >
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: 0.45 }}
      className="relative overflow-hidden rounded-[2rem] border border-slate-800/80 bg-slate-950 shadow-2xl shadow-slate-900/25"
    >
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -right-20 top-0 h-72 w-72 rounded-full bg-brand-violet/20 blur-3xl"
        animate={{ opacity: [0.35, 0.55, 0.35] }}
        transition={{ duration: 9, repeat: Infinity }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -left-16 bottom-0 h-64 w-64 rounded-full bg-brand-cyan/15 blur-3xl"
        animate={{ opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 11, repeat: Infinity }}
      />

      <div className="relative border-b border-white/10 px-6 py-8 sm:px-10 sm:py-10">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-brand-cyan">
              <Cpu className="h-3.5 w-3.5" aria-hidden />
              Deterministic automation
            </div>
            <h3 className="mt-5 text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Enterprise hygiene without generative guesswork
            </h3>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-slate-300 sm:text-base">
              Peacock generates step language from captured element metadata —
              predictable, editable, and entirely on device. today your teams
              get consistent output they can audit, refine, and ship.
            </p>
          </div>

          <dl className="grid grid-cols-2 gap-3">
            {AUTOMATION_STATS.map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-4 text-center backdrop-blur-sm"
              >
                <dt className="text-[0.65rem] font-semibold uppercase tracking-wide text-slate-400">
                  {stat.label}
                </dt>
                <dd className="mt-2 text-2xl font-bold text-white">
                  {stat.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="mt-8 flex flex-wrap gap-2">
          {[
            "Rule-based step titles",
            "Capture screenshot",
            "Sensitive URL pauses",
            "Screenshot editor",
            "Download / Copy to Clipboard",
          ].map((label) => (
            <span
              key={label}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-slate-200"
            >
              <ShieldCheck
                className="h-3.5 w-3.5 text-emerald-400"
                aria-hidden
              />
              {label}
            </span>
          ))}
        </div>
      </div>

      <div className="relative px-6 py-8 sm:px-10 sm:py-10">
        <div
          aria-hidden
          className="absolute left-10 right-10 top-[4.5rem] hidden h-px bg-gradient-to-r from-transparent via-brand-cyan/40 to-transparent lg:block"
        />

        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-cyan">
              Lifecycle coverage
            </p>
            <p className="mt-2 text-sm text-slate-400">
              Smart defaults activate at capture, persist in your library, and
              streamline delivery.
            </p>
          </div>
          <span className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 text-xs font-semibold text-slate-200">
            {AUTOMATION_ITEMS.length} automations · 3 stages
          </span>
        </div>

        <div className="grid gap-8 lg:grid-cols-3 lg:gap-6">
          {AUTOMATION_BY_STAGE.map((stage, stageIndex) => (
            <AutomationStagePanel
              key={stage.id}
              step={stage.step}
              label={stage.label}
              description={stage.description}
              icon={stage.icon}
              items={stage.items}
              stageIndex={stageIndex}
              isLast={stageIndex === AUTOMATION_BY_STAGE.length - 1}
            />
          ))}
        </div>
      </div>

      <div className="relative border-t border-white/10 bg-white/[0.02] px-6 py-8 sm:px-10">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
          What teams gain
        </p>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {AUTOMATION_OUTCOMES.map((outcome, index) => (
            <motion.article
              key={outcome.title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
              className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-transparent p-5"
            >
              <h4 className="text-sm font-semibold text-white">
                {outcome.title}
              </h4>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">
                {outcome.copy}
              </p>
            </motion.article>
          ))}
        </div>
      </div>
    </motion.div>
  </LandingSectionShell>
);
