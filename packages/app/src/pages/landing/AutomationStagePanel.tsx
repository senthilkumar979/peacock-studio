import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { ArrowRight } from "lucide-react";
import { AutomationItemCard } from "./AutomationItemCard";
import type { LandingAutomationItem } from "./landingData";

interface AutomationStagePanelProps {
  step: string;
  label: string;
  description: string;
  icon: LucideIcon;
  items: LandingAutomationItem[];
  stageIndex: number;
  isLast: boolean;
}

export const AutomationStagePanel = ({
  step,
  label,
  description,
  icon: StageIcon,
  items,
  stageIndex,
  isLast,
}: AutomationStagePanelProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.15 }}
    transition={{ delay: stageIndex * 0.1, duration: 0.4 }}
    className="relative flex flex-col"
  >
    <div className="mb-5 flex items-start gap-4">
      <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-brand-cyan ring-1 ring-white/15">
        <StageIcon className="h-5 w-5" aria-hidden />
      </span>
      <div>
        <p className="text-[0.65rem] font-bold tracking-[0.2em] text-brand-cyan">
          {step}
        </p>
        <h3 className="mt-1 text-lg font-semibold text-white">{label}</h3>
        <p className="mt-1 text-sm leading-relaxed text-slate-400">
          {description}
        </p>
      </div>
    </div>

    <div className="flex flex-col gap-3">
      {items.map((item, index) => (
        <AutomationItemCard key={item.title} item={item} index={index} />
      ))}
    </div>

    {!isLast ? (
      <ArrowRight
        className="absolute -right-4 top-14 hidden h-5 w-5 text-white/25 lg:block"
        aria-hidden
      />
    ) : null}
  </motion.div>
);
