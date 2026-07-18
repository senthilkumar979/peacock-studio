import type { LucideIcon } from 'lucide-react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface LibraryPageHeaderProps {
  title: string;
  description: string;
  icon: LucideIcon;
  action?: React.ReactNode;
}

export const LibraryPageHeader = ({
  title,
  description,
  icon: Icon,
  action,
}: LibraryPageHeaderProps) => (
  <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
    <div>
      <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900">
        <Icon className="h-6 w-6 text-peacock-600" aria-hidden />
        {title}
      </h1>
      <p className="mt-1 max-w-2xl text-sm text-slate-500">{description}</p>
    </div>
    {action}
  </div>
);

interface DashboardRecentSectionProps {
  title: string;
  description: string;
  icon: LucideIcon;
  viewAllHref: string;
  viewAllLabel?: string;
  toolbar?: React.ReactNode;
  children: React.ReactNode;
}

export const DashboardRecentSection = ({
  title,
  description,
  icon: Icon,
  viewAllHref,
  viewAllLabel = 'View all',
  toolbar,
  children,
}: DashboardRecentSectionProps) => (
  <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xl shadow-slate-200/60">
    <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
          <Icon className="h-5 w-5 text-peacock-600" aria-hidden />
          {title}
        </h2>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        {toolbar}
        <Link
          to={viewAllHref}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-peacock-700 hover:text-peacock-800"
        >
          {viewAllLabel}
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </div>
    </div>
    <div className="p-6 pt-2">{children}</div>
  </section>
);
