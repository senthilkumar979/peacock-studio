import { healthResult } from '@/utils/health/healthResult';
import type { HealthCheckResult } from '@/types/health';

export function checkLogSources(cloudInitError: string | null): HealthCheckResult[] {
  const results: HealthCheckResult[] = [
    healthResult(
      'log-console',
      'logs',
      'Client diagnostics',
      'pass',
      'Health Checker collects pass/fail details below. Copy the report to share with support.',
    ),
  ];

  if (cloudInitError) {
    results.push(
      healthResult('log-cloud-init', 'logs', 'Cloud init error', 'fail', cloudInitError),
    );
  } else {
    results.push(
      healthResult(
        'log-cloud-init',
        'logs',
        'Cloud init error',
        'pass',
        'No cloud initialization error recorded.',
      ),
    );
  }

  return results;
}
