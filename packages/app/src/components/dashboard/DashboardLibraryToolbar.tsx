import type { DashboardSortMode } from '@/utils/dashboardLibrary';
import type { DashboardViewMode } from '@/types/savedFlow';
import { ViewModeToggle } from './ViewModeToggle';

interface DashboardLibraryToolbarProps {
  searchQuery: string;
  sortMode: DashboardSortMode;
  viewMode: DashboardViewMode;
  resultCount: number;
  totalCount: number;
  onSearchChange: (value: string) => void;
  onSortChange: (mode: DashboardSortMode) => void;
  onViewChange: (mode: DashboardViewMode) => void;
}

const SORT_OPTIONS: { value: DashboardSortMode; label: string }[] = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'mostSteps', label: 'Most steps' },
  { value: 'title', label: 'Title A–Z' },
];

export const DashboardLibraryToolbar = ({
  searchQuery,
  sortMode,
  viewMode,
  resultCount,
  totalCount,
  onSearchChange,
  onSortChange,
  onViewChange,
}: DashboardLibraryToolbarProps) => (
  <div className="flex flex-col gap-4 border-b border-slate-100 px-6 py-5 lg:flex-row lg:items-end lg:justify-between">
    <div className="min-w-0">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-lg font-bold text-slate-900">Your documentations</h2>
        <span className="rounded-full bg-peacock-50 px-2.5 py-0.5 text-xs font-semibold text-peacock-700 ring-1 ring-peacock-100">
          {resultCount === totalCount ? `${totalCount} total` : `${resultCount} of ${totalCount}`}
        </span>
      </div>
      <p className="mt-1 text-sm text-slate-500">
        Record with the extension — new flows appear here automatically.
      </p>
    </div>

    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <label className="relative block min-w-[220px]">
        <span className="sr-only">Search documentations</span>
        <SearchIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="search"
          value={searchQuery}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search by title or description…"
          className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm text-slate-900 outline-none ring-peacock-500 transition placeholder:text-slate-400 focus:border-peacock-300 focus:bg-white focus:ring-2"
        />
      </label>

      <label className="block">
        <span className="sr-only">Sort documentations</span>
        <select
          value={sortMode}
          onChange={(event) => onSortChange(event.target.value as DashboardSortMode)}
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-medium text-slate-700 outline-none ring-peacock-500 focus:border-peacock-300 focus:bg-white focus:ring-2 sm:w-auto"
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <ViewModeToggle value={viewMode} onChange={onViewChange} />
    </div>
  </div>
);

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.75" />
      <path d="M20 20l-3-3" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}
