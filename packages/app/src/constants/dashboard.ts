import type { DashboardViewMode } from '@/types/savedFlow';

export const DASHBOARD_VIEW_STORAGE_KEY = 'peacock-dashboard-view';

export const DEFAULT_DASHBOARD_VIEW: DashboardViewMode = 'table';

export function readDashboardViewMode(): DashboardViewMode {
  const stored = localStorage.getItem(DASHBOARD_VIEW_STORAGE_KEY);
  if (stored === 'table' || stored === 'card' || stored === 'list') return stored;
  return DEFAULT_DASHBOARD_VIEW;
}

export function writeDashboardViewMode(mode: DashboardViewMode): void {
  localStorage.setItem(DASHBOARD_VIEW_STORAGE_KEY, mode);
}
