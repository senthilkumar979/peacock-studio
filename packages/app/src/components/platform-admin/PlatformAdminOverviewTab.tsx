import type { LucideIcon } from 'lucide-react';
import { Building2, FileText, HardDrive, Link2, Map, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { OrgDomainUsageTable } from '@/components/org-admin/OrgDomainUsageTable';
import type { PlatformOverview } from '@/cloud/repositories/platformAdminRepository';
import { formatBytes } from '@/utils/formatBytes';

interface PlatformAdminOverviewTabProps {
  overview: PlatformOverview;
}

interface CardModel {
  label: string;
  value: string | number;
  hint: string;
  accent: string;
  icon: LucideIcon;
}

export const PlatformAdminOverviewTab = ({ overview }: PlatformAdminOverviewTabProps) => {
  const cards: CardModel[] = [
    {
      label: 'Organizations',
      value: overview.organizationCount,
      hint: 'Personal + team workspaces',
      accent: 'from-peacock-500 to-peacock-700',
      icon: Building2,
    },
    {
      label: 'Users',
      value: overview.userCount,
      hint: 'Distinct active members',
      accent: 'from-brand-cyan to-peacock-600',
      icon: Users,
    },
    {
      label: 'Flow docs',
      value: overview.documentCount,
      hint: `${overview.tourCount} product tours`,
      accent: 'from-brand-violet to-peacock-700',
      icon: FileText,
    },
    {
      label: 'Storage',
      value: formatBytes(overview.totalStorageBytes),
      hint: `${overview.activeShareLinkCount} active share links`,
      accent: 'from-peacock-500 to-brand-cyan',
      icon: HardDrive,
    },
  ];

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card, index) => {
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
                <Icon className="h-[18px] w-[18px]" aria-hidden />
              </span>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                {card.label}
              </p>
              <p className="mt-2 text-3xl font-bold tabular-nums tracking-tight text-slate-900">
                {card.value}
              </p>
              <p className="mt-1 text-xs text-slate-400">{card.hint}</p>
            </motion.article>
          );
        })}
      </div>

      <div className="flex items-center gap-2 text-sm text-slate-600">
        <Map className="h-4 w-4 text-peacock-600" aria-hidden />
        <Link2 className="h-4 w-4 text-slate-400" aria-hidden />
        <span>Platform-wide domains captured across all flow documents</span>
      </div>

      <OrgDomainUsageTable rows={overview.topDomains} />
    </div>
  );
};
