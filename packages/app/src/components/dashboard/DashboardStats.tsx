import type { ReactNode } from 'react';
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
  icon: ReactNode;
}

const STAT_CONFIG: StatConfig[] = [
  {
    key: 'totalDocuments',
    label: 'Total documentations',
    hint: 'Saved on this device',
    accent: 'from-peacock-500 to-peacock-700',
    icon: <DocIcon />,
  },
  {
    key: 'totalThisWeek',
    label: 'Created this week',
    hint: 'Since Monday',
    accent: 'from-brand-cyan to-peacock-600',
    icon: <CalendarIcon />,
  },
  {
    key: 'totalThisMonth',
    label: 'Created this month',
    hint: 'Current calendar month',
    accent: 'from-brand-violet to-peacock-700',
    icon: <TrendIcon />,
  },
  {
    key: 'totalStepsDocumented',
    label: 'Steps documented',
    hint: 'Across all flows',
    accent: 'from-peacock-600 to-brand-violet',
    icon: <StepsIcon />,
  },
  {
    key: 'averageStepsPerDocument',
    label: 'Avg steps per doc',
    hint: 'Flow depth indicator',
    accent: 'from-peacock-500 to-brand-cyan',
    icon: <AverageIcon />,
  },
];

export const DashboardStats = ({ stats }: DashboardStatsProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.45, delay: 0.15 }}
    className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5"
  >
    {STAT_CONFIG.map((item, index) => (
      <motion.article
        key={item.key}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.2 + index * 0.05 }}
        whileHover={{ y: -3 }}
        className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-lg shadow-slate-200/50"
      >
        <motion.div
          aria-hidden
          className={`absolute -right-6 -top-6 h-20 w-20 rounded-full bg-gradient-to-br ${item.accent} opacity-10 transition-opacity group-hover:opacity-20`}
        />
        <motion.div
          aria-hidden
          className={`mb-4 inline-flex rounded-xl bg-gradient-to-br ${item.accent} p-2.5 text-white shadow-md`}
        >
          {item.icon}
        </motion.div>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{item.label}</p>
        <p className="mt-2 text-3xl font-bold tabular-nums tracking-tight text-slate-900">
          {stats[item.key]}
        </p>
        <p className="mt-1 text-xs text-slate-400">{item.hint}</p>
      </motion.article>
    ))}
  </motion.div>
);

function DocIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M7 3h7l5 5v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z"
        stroke="currentColor"
        strokeWidth="1.75"
      />
      <path d="M14 3v5h5" stroke="currentColor" strokeWidth="1.75" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.75" />
      <path d="M8 3v4M16 3v4M3 10h18" stroke="currentColor" strokeWidth="1.75" />
    </svg>
  );
}

function TrendIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M4 17l5-5 4 4 7-8" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      <path d="M17 8h3v3" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

function StepsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M4 7h16M4 12h10M4 17h14" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

function AverageIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.75" />
      <path d="M12 8v8M9 12h6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}
