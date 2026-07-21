import type { LucideIcon } from 'lucide-react';
import { Eye, FileDown, Code2, Globe } from 'lucide-react';
import { motion } from 'framer-motion';
import type { OrgAnalyticsSummary } from '@/types/analytics';

interface AnalyticsSummaryCardsProps {
  summary: OrgAnalyticsSummary;
  avgViewsPerDoc: number;
}

interface CardModel {
  label: string;
  value: string | number;
  hint: string;
  accent: string;
  icon: LucideIcon;
}

const ICON_CLASS = 'h-[18px] w-[18px]';

function buildCards(summary: OrgAnalyticsSummary, avgViewsPerDoc: number): CardModel[] {
  const topReferrer = summary.topReferrers[0]?.referrerDomain ?? '—';
  return [
    {
      label: 'Total views',
      value: summary.totals.views,
      hint: 'Shared & embedded opens',
      accent: 'from-peacock-500 to-peacock-700',
      icon: Eye,
    },
    {
      label: 'PDF exports',
      value: summary.totals.pdfExports,
      hint: 'Downloaded documents',
      accent: 'from-brand-cyan to-peacock-600',
      icon: FileDown,
    },
    {
      label: 'Embed views',
      value: summary.totals.embedViews,
      hint: 'Impressions on embeds',
      accent: 'from-brand-violet to-peacock-700',
      icon: Code2,
    },
    {
      label: 'Avg views / doc',
      value: avgViewsPerDoc.toFixed(1),
      hint: `Top referrer: ${topReferrer}`,
      accent: 'from-peacock-500 to-brand-cyan',
      icon: Globe,
    },
  ];
}

export const AnalyticsSummaryCards = ({ summary, avgViewsPerDoc }: AnalyticsSummaryCardsProps) => (
  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
    {buildCards(summary, avgViewsPerDoc).map((card, index) => {
      const Icon = card.icon;
      return (
        <motion.article
          key={card.label}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: index * 0.05 }}
          className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-lg shadow-slate-200/50"
        >
          <div
            aria-hidden
            className={`absolute -right-6 -top-6 h-20 w-20 rounded-full bg-gradient-to-br ${card.accent} opacity-10 transition-opacity group-hover:opacity-20`}
          />
          <span
            aria-hidden
            className={`mb-4 inline-flex rounded-xl bg-gradient-to-br ${card.accent} p-2.5 text-white shadow-md`}
          >
            <Icon className={ICON_CLASS} aria-hidden />
          </span>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{card.label}</p>
          <p className="mt-2 text-3xl font-bold tabular-nums tracking-tight text-slate-900">{card.value}</p>
          <p className="mt-1 text-xs text-slate-400">{card.hint}</p>
        </motion.article>
      );
    })}
  </div>
);
