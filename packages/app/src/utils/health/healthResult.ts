import type { HealthCategory, HealthCheckResult, HealthStatus } from '@/types/health';

export function healthResult(
  id: string,
  category: HealthCategory,
  label: string,
  status: HealthStatus,
  detail: string,
): HealthCheckResult {
  return { id, category, label, status, detail, checkedAt: Date.now() };
}
