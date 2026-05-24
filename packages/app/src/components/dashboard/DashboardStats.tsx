import type { LucideIcon } from 'lucide-react';
import {
  Calendar,
  FileStack,
  ListOrdered,
  PieChart,
  TrendingUp,
} from 'lucide-react';
import { motion } from 'framer-motion';
import type { DashboardStats as DashboardStatsModel } from '@/utils/dashboardStats';

interface DashboardStatsProps {
  stats: DashboardStatsModel;
}

interface StatConfig {
  key: keyof DashboardStatsModel;
  label: string;
  hint: string;
  accent: string;
  icon: LucideIcon;
}

const ICON_CLASS = 'h-[18px] w-[18px]';

const STAT_CONFIG: StatConfig[] = [
  {
    key: 'totalDocuments',
    label: 'Total documentations',
    hint: 'Saved on this device',
    accent: 'from-peacock-500 to-peacock-700',
    icon: FileStack,
  },
  {
    key: 'totalThisWeek',
    label: 'Created this week',
    hint: 'Since Monday',
    accent: 'from-brand-cyan to-peacock-600',
    icon: Calendar,
  },
  {
    key: 'totalThisMonth',
    label: 'Created this month',
    hint: 'Current calendar month',
    accent: 'from-brand-violet to-peacock-700',
    icon: TrendingUp,
  },
  {
    key: 'totalStepsDocumented',
    label: 'Steps documented',
    hint: 'Across all flows',
    accent: 'from-peacock-600 to-brand-violet',
    icon: ListOrdered,
  },
  {
    key: 'averageStepsPerDocument',
    label: 'Avg steps per doc',
    hint: 'Flow depth indicator',
    accent: 'from-peacock-500 to-brand-cyan',
    icon: PieChart,
  },
];

export const DashboardStats = ({ stats }: DashboardStatsProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.45, delay: 0.15 }}
    className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5"
  >
    {STAT_CONFIG.map((item, index) => {
      const Icon = item.icon;
      return (
        <motion.article
          key={item.key}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.2 + index * 0.05 }}
          whileHover={{ y: -3 }}
          className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-lg shadow-slate-200/50"
        >
          <div
            aria-hidden
            className={`absolute -right-6 -top-6 h-20 w-20 rounded-full bg-gradient-to-br ${item.accent} opacity-10 transition-opacity group-hover:opacity-20`}
          />
          <motion.div
            aria-hidden
            className={`mb-4 inline-flex rounded-xl bg-gradient-to-br ${item.accent} p-2.5 text-white shadow-md`}
          >
            <Icon className={ICON_CLASS} aria-hidden />
          </motion.div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{item.label}</p>
          <p className="mt-2 text-3xl font-bold tabular-nums tracking-tight text-slate-900">
            {stats[item.key]}
          </p>
          <p className="mt-1 text-xs text-slate-400">{item.hint}</p>
        </motion.article>
      );
    })}
  </motion.div>
);
