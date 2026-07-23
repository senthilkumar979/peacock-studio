import { FileDown, FileText, Link2, Map as MapIcon, Trophy } from 'lucide-react';
import { ContributorBoardCard } from '@/components/org-admin/ContributorBoardCard';
import { topContributorHint, type ContributorBoard } from '@/components/org-admin/contributorLeadersHelpers';
import type { OrgAdminActivity } from '@/cloud/repositories/organizationRepository';

interface OrgContributorLeadersProps {
  activity: OrgAdminActivity;
  days?: number;
}

export function overviewLeaderHints(activity: OrgAdminActivity): {
  docs?: string;
  tours?: string;
  exports?: string;
  shares?: string;
} {
  return {
    docs: topContributorHint(activity.docsByCreator, 'docs') ?? undefined,
    tours: topContributorHint(activity.toursByCreator, 'tours') ?? undefined,
    exports: topContributorHint(activity.exportsByActor, 'exports') ?? undefined,
    shares: topContributorHint(activity.sharesByActor, 'shares') ?? undefined,
  };
}

export const OrgContributorLeaders = ({ activity, days = 30 }: OrgContributorLeadersProps) => {
  const boards: ContributorBoard[] = [
    {
      title: 'Docs created',
      subtitle: 'All time by creator',
      unit: 'docs',
      icon: FileText,
      accent: 'from-peacock-500 to-peacock-700',
      rows: activity.docsByCreator,
    },
    {
      title: 'Tours created',
      subtitle: 'All time by creator',
      unit: 'tours',
      icon: MapIcon,
      accent: 'from-brand-violet to-peacock-700',
      rows: activity.toursByCreator,
    },
    {
      title: 'Exports',
      subtitle: `Last ${days} days`,
      unit: 'exports',
      icon: FileDown,
      accent: 'from-brand-cyan to-peacock-600',
      rows: activity.exportsByActor,
    },
    {
      title: 'Share links',
      subtitle: `Last ${days} days`,
      unit: 'shares',
      icon: Link2,
      accent: 'from-amber-500 to-orange-600',
      rows: activity.sharesByActor,
    },
  ];

  return (
    <section className="space-y-4">
      <header className="flex items-center gap-2.5">
        <span className="inline-flex rounded-lg bg-amber-50 p-2 text-amber-700 ring-1 ring-amber-100">
          <Trophy className="h-4 w-4" aria-hidden />
        </span>
        <div>
          <h2 className="text-base font-semibold text-slate-900">Top contributors</h2>
          <p className="text-xs text-slate-500">
            Who created the most docs, tours, exports, and shares
          </p>
        </div>
      </header>
      <div className="grid gap-4 lg:grid-cols-2">
        {boards.map((board) => (
          <ContributorBoardCard key={board.title} board={board} />
        ))}
      </div>
    </section>
  );
};
