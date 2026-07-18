import type { DashboardViewMode } from '@/types/savedFlow';
import type { DashboardSortMode } from '@/utils/dashboardLibrary';
import { ArrowDownUp, ScanEye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ExpandableLibrarySearch } from '@/components/dashboard/ExpandableLibrarySearch';
import { ViewModeToggle } from '@/components/dashboard/ViewModeToggle';
import { getFlowDocsBackState } from '@/utils/libraryNavigation';

interface FlowDocsLibraryToolbarProps {
  searchQuery: string;
  sortMode: DashboardSortMode;
  viewMode: DashboardViewMode;
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

export const FlowDocsLibraryToolbar = ({
  searchQuery,
  sortMode,
  viewMode,
  onSearchChange,
  onSortChange,
  onViewChange,
}: FlowDocsLibraryToolbarProps) => (
  <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-x-3 gap-y-3 border-b border-slate-100 px-5 py-4">
    <div className="justify-self-start">
      <ExpandableLibrarySearch value={searchQuery} onChange={onSearchChange} />
    </div>

    <Link
      to="/compare"
      state={getFlowDocsBackState()}
      className="inline-flex shrink-0 items-center justify-center gap-2 justify-self-center rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:border-peacock-200 hover:bg-white hover:text-peacock-700"
    >
      <ScanEye className="h-4 w-4 text-slate-500" aria-hidden />
      Compare flows
    </Link>

    <div className="flex items-center justify-end gap-3 justify-self-end">
      <label className="relative block shrink-0">
        <span className="sr-only">Sort documentations</span>
        <ArrowDownUp
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
          aria-hidden
        />
        <select
          value={sortMode}
          onChange={(event) => onSortChange(event.target.value as DashboardSortMode)}
          className="appearance-none rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-8 text-sm font-medium text-slate-700 outline-none ring-peacock-500 focus:border-peacock-300 focus:bg-white focus:ring-2"
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
