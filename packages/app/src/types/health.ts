export type HealthStatus = 'pass' | 'warn' | 'fail' | 'skip' | 'checking';

export type HealthCategory = 'pages' | 'connections' | 'logs';

export interface HealthCheckResult {
  id: string;
  category: HealthCategory;
  label: string;
  status: HealthStatus;
  detail: string;
  checkedAt: number;
}

export interface HealthReport {
  results: HealthCheckResult[];
  ranAt: number;
  isRunning: boolean;
  error: string | null;
}
