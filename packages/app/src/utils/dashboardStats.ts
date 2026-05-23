import type { SavedFlowSummary } from '@/types/savedFlow';

export interface DashboardStats {
  totalDocuments: number;
  totalThisWeek: number;
  totalThisMonth: number;
  totalStepsDocumented: number;
  averageStepsPerDocument: number;
}

function startOfWeekMs(now: Date): number {
  const day = now.getDay();
  const diff = day === 0 ? 6 : day - 1;
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - diff);
  return start.getTime();
}

function startOfMonthMs(now: Date): number {
  return new Date(now.getFullYear(), now.getMonth(), 1).getTime();
}

export function computeDashboardStats(summaries: SavedFlowSummary[]): DashboardStats {
  const now = new Date();
  const weekStart = startOfWeekMs(now);
  const monthStart = startOfMonthMs(now);

  const totalDocuments = summaries.length;
  const totalThisWeek = summaries.filter((item) => item.generatedAt >= weekStart).length;
  const totalThisMonth = summaries.filter((item) => item.generatedAt >= monthStart).length;
  const totalStepsDocumented = summaries.reduce((sum, item) => sum + item.stepCount, 0);
  const averageStepsPerDocument =
    totalDocuments > 0 ? Math.round((totalStepsDocumented / totalDocuments) * 10) / 10 : 0;

  return {
    totalDocuments,
    totalThisWeek,
    totalThisMonth,
    totalStepsDocumented,
    averageStepsPerDocument,
  };
}
