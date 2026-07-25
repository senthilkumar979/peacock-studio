export type HealthStatus = 'pass' | 'warn' | 'fail' | 'skip' | 'checking';

export type HealthCategory = 'pages' | 'connections' | 'logs';

/** Super-admin facing explanation of what a check covers and how it runs. */
export interface HealthCheckMethod {
  /** What this check is verifying. */
  what: string;
  /** How the probe runs (signals, APIs, env reads). */
  how: string;
  /** What a pass / warn / fail / skip typically means. */
  interpret: string;
}

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
