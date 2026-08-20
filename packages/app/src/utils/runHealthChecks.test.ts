import { beforeEach, describe, expect, it, vi } from 'vitest';
import { formatHealthReport, runHealthChecks } from './runHealthChecks';
import type { HealthCheckResult } from '@/types/health';

vi.mock('@/cloud/sessionState', () => ({
  getSessionModeSnapshot: vi.fn(() => 'guest'),
}));

vi.mock('@/utils/health/checkConnections', () => ({
  checkCloudConfig: vi.fn(() => ({
    id: 'cloud-config',
    category: 'connections',
    label: 'Cloud',
    status: 'skip',
    detail: 'off',
    checkedAt: 1,
  })),
  checkExtension: vi.fn(async () => ({
    id: 'extension',
    category: 'connections',
    label: 'Ext',
    status: 'warn',
    detail: 'missing',
    checkedAt: 1,
  })),
  checkIndexedDb: vi.fn(async () => ({
    id: 'indexeddb',
    category: 'connections',
    label: 'IDB',
    status: 'pass',
    detail: 'ok',
    checkedAt: 1,
  })),
  checkSession: vi.fn(() => ({
    id: 'session',
    category: 'connections',
    label: 'Session',
    status: 'pass',
    detail: 'guest',
    checkedAt: 1,
  })),
}));

vi.mock('@/utils/health/checkLogs', () => ({
  checkLogSources: vi.fn(() => [
    {
      id: 'log-console',
      category: 'logs',
      label: 'Logs',
      status: 'pass',
      detail: 'ok',
      checkedAt: 1,
    },
  ]),
}));

vi.mock('@/utils/health/checkObservability', () => ({
  checkObservability: vi.fn(() => [
    {
      id: 'sentry',
      category: 'connections',
      label: 'Sentry',
      status: 'skip',
      detail: 'off',
      checkedAt: 1,
    },
  ]),
}));

vi.mock('@/utils/health/checkPages', () => ({
  checkPages: vi.fn(async () => [
    {
      id: 'page-dashboard',
      category: 'pages',
      label: 'Dashboard',
      status: 'pass',
      detail: 'ok',
      checkedAt: 1,
    },
  ]),
}));

vi.mock('@/utils/health/checkSupabase', () => ({
  checkSupabase: vi.fn(async () => ({
    id: 'supabase',
    category: 'connections',
    label: 'Supabase',
    status: 'skip',
    detail: 'off',
    checkedAt: 1,
  })),
}));

vi.mock('@/utils/health/healthCheckMethods', () => ({
  getHealthCheckMethod: vi.fn((id: string) =>
    id === 'indexeddb'
      ? { what: 'Open DB', how: 'Dexie', interpret: 'Pass means local OK' }
      : null,
  ),
}));

import { checkLogSources } from '@/utils/health/checkLogs';
import { getSessionModeSnapshot } from '@/cloud/sessionState';

describe('runHealthChecks', () => {
  beforeEach(() => {
    vi.mocked(checkLogSources).mockClear();
  });

  it('aggregates page, connection, observability, and log results', async () => {
    const results = await runHealthChecks('init boom');
    expect(checkLogSources).toHaveBeenCalledWith('init boom');
    expect(results.map((r) => r.id)).toEqual(
      expect.arrayContaining([
        'page-dashboard',
        'cloud-config',
        'session',
        'indexeddb',
        'extension',
        'supabase',
        'sentry',
        'log-console',
      ]),
    );
  });
});

describe('formatHealthReport', () => {
  it('formats ISO timestamp, session, and method details', () => {
    vi.mocked(getSessionModeSnapshot).mockReturnValue('cloud');
    const results: HealthCheckResult[] = [
      {
        id: 'indexeddb',
        category: 'connections',
        label: 'IndexedDB',
        status: 'pass',
        detail: 'opened',
        checkedAt: 1,
      },
      {
        id: 'extension',
        category: 'connections',
        label: 'Extension',
        status: 'warn',
        detail: 'missing',
        checkedAt: 1,
      },
    ];

    const report = formatHealthReport(results, Date.parse('2026-08-12T10:00:00.000Z'));
    expect(report).toContain('Peacock Health Report — 2026-08-12T10:00:00.000Z');
    expect(report).toContain('Session: cloud');
    expect(report).toContain('[PASS] (connections) IndexedDB: opened');
    expect(report).toContain('What: Open DB');
    expect(report).toContain('How: Dexie');
    expect(report).toContain('Interpret: Pass means local OK');
    expect(report).toContain('[WARN] (connections) Extension: missing');
  });
});
