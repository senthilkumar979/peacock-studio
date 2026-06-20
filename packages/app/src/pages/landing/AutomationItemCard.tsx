import { motion } from "framer-motion";
import type { LandingAutomationItem } from "./landingData";

interface AutomationItemCardProps {
  item: LandingAutomationItem;
  index: number;
}

export const AutomationItemCard = ({
  item,
  index,
}: AutomationItemCardProps) => {
  const Icon = item.icon;

  return (
    <motion.article
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ delay: index * 0.06, duration: 0.35 }}
      className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-sm transition hover:border-brand-cyan/30 hover:bg-white/[0.07]"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-brand-cyan/10 blur-2xl transition group-hover:bg-brand-cyan/20"
      />

      <div className="relative flex items-start justify-between gap-3">
        <span className="inline-flex rounded-xl bg-gradient-to-br from-peacock-500/25 to-brand-violet/20 p-2.5 text-brand-cyan ring-1 ring-white/10">
          <Icon className="h-4 w-4" aria-hidden />
        </span>
        {/* <ArrowUpRight
          className="h-4 w-4 shrink-0 text-white/20 transition group-hover:text-brand-cyan"
          aria-hidden
        /> */}
      </div>

      <h4 className="relative mt-4 text-sm font-semibold text-white">
        {item.title}
      </h4>
      <p className="relative mt-2 text-sm leading-relaxed text-slate-300">
        {item.copy}
      </p>
      <p className="relative mt-4 rounded-lg border border-emerald-400/20 bg-emerald-500/10 px-3 py-2 text-xs font-medium leading-relaxed text-emerald-200">
        {item.outcome}
      </p>
    </motion.article>
  );
};
