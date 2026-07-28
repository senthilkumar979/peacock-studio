import {
  getCloudSyncMissingConfigMessage,
  isCloudSyncFlagEnabled,
} from '@/cloud/config';
import { getCloudEnvValidationError } from '@/cloud/validateCloudEnv';
import { isCloudLibraryActive } from '@/cloud/authContext';
import { getSessionModeSnapshot } from '@/cloud/sessionState';
import { listFlowSummaries as listLocalFlowSummaries } from '@/storage/flowLibraryDb';
import { probeExtensionInstalled } from '@/utils/probeExtensionInstalled';
import { healthResult } from '@/utils/health/healthResult';
import type { HealthCheckResult, HealthStatus } from '@/types/health';

export async function checkIndexedDb(): Promise<HealthCheckResult> {
  try {
    const docs = await listLocalFlowSummaries();
    return healthResult(
      'indexeddb',
      'connections',
      'IndexedDB (local library)',
      'pass',
      `Opened peacock-flow-library — ${docs.length} local flow doc(s).`,
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return healthResult(
      'indexeddb',
      'connections',
      'IndexedDB (local library)',
      'fail',
      `Could not open local library: ${message}`,
    );
  }
}

export async function checkExtension(): Promise<HealthCheckResult> {
  const installed = await probeExtensionInstalled();
  return healthResult(
    'extension',
    'connections',
    'Browser extension bridge',
    installed ? 'pass' : 'warn',
    installed
      ? 'Extension content script responded on this origin.'
      : 'Extension not detected. Install it to capture flows from the browser.',
  );
}

export function checkCloudConfig(): HealthCheckResult {
  if (!isCloudSyncFlagEnabled()) {
    return healthResult(
      'cloud-config',
      'connections',
      'Cloud sync config',
      'skip',
      'VITE_CLOUD_SYNC is off — app runs fully local.',
    );
  }

  const missing = getCloudSyncMissingConfigMessage();
  if (missing) {
    return healthResult('cloud-config', 'connections', 'Cloud sync config', 'fail', missing);
  }

  const validation = getCloudEnvValidationError();
  if (validation) {
    return healthResult('cloud-config', 'connections', 'Cloud sync config', 'fail', validation);
  }

  return healthResult(
    'cloud-config',
    'connections',
    'Cloud sync config',
    'pass',
    'Clerk and Supabase publishable env vars look valid.',
  );
}

export function checkSession(): HealthCheckResult {
  const mode = getSessionModeSnapshot();
  const detailByMode: Record<string, { status: HealthStatus; detail: string }> = {
    local: { status: 'pass', detail: 'Local-only session (cloud sync disabled).' },
    loading: { status: 'warn', detail: 'Auth is still loading.' },
    guest: { status: 'pass', detail: 'Guest session — using IndexedDB library.' },
    connecting: { status: 'warn', detail: 'Signed in; connecting cloud library…' },
    onboarding: { status: 'warn', detail: 'Signed in; workspace onboarding pending.' },
    cloud: {
      status: 'pass',
      detail: isCloudLibraryActive()
        ? 'Cloud library active.'
        : 'Cloud session without an active organization library.',
    },
  };
  const mapped = detailByMode[mode] ?? {
    status: 'warn' as const,
    detail: `Unknown session mode: ${mode}`,
  };
  return healthResult('session', 'connections', 'Session mode', mapped.status, mapped.detail);
}
