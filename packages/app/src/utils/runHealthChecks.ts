import { getSessionModeSnapshot } from '@/cloud/sessionState';
import {
  checkCloudConfig,
  checkExtension,
  checkIndexedDb,
  checkSession,
} from '@/utils/health/checkConnections';
import { checkLogSources } from '@/utils/health/checkLogs';
import { checkObservability } from '@/utils/health/checkObservability';
import { checkPages } from '@/utils/health/checkPages';
import { checkSupabase } from '@/utils/health/checkSupabase';
import { getHealthCheckMethod } from '@/utils/health/healthCheckMethods';
import type { HealthCheckResult } from '@/types/health';

/** Runs client-side health probes for pages, connections, and diagnostic logs. */
export async function runHealthChecks(
  cloudInitError: string | null,
): Promise<HealthCheckResult[]> {
  const [pages, indexedDb, extension, supabase] = await Promise.all([
    checkPages(),
    checkIndexedDb(),
    checkExtension(),
    checkSupabase(),
  ]);

  return [
    ...pages,
    checkCloudConfig(),
    checkSession(),
    indexedDb,
    extension,
    supabase,
    ...checkObservability(),
    ...checkLogSources(cloudInitError),
  ];
}

export function formatHealthReport(results: HealthCheckResult[], ranAt: number): string {
  const lines = [
    `Peacock Health Report — ${new Date(ranAt).toISOString()}`,
    `Session: ${getSessionModeSnapshot()}`,
    '',
  ];
  for (const item of results) {
    lines.push(`[${item.status.toUpperCase()}] (${item.category}) ${item.label}: ${item.detail}`);
    const method = getHealthCheckMethod(item.id);
    if (method) {
      lines.push(`  What: ${method.what}`);
      lines.push(`  How: ${method.how}`);
      lines.push(`  Interpret: ${method.interpret}`);
    }
    lines.push('');
  }
  return lines.join('\n');
}
