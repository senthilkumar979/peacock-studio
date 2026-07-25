export type CloudSyncPhase = 'idle' | 'syncing' | 'success' | 'error';

export interface CloudSyncSnapshot {
  phase: CloudSyncPhase;
  message: string | null;
  importedDocuments: number;
  exceedsFreeLimit: boolean;
  /** When false, sync runs silently (no banner). Upgrade modal may still open. */
  visible: boolean;
}

const PENDING_SUCCESS_KEY = 'peacock-cloud-sync-pending-success';

let snapshot: CloudSyncSnapshot = {
  phase: 'idle',
  message: null,
  importedDocuments: 0,
  exceedsFreeLimit: false,
  visible: false,
};

const listeners = new Set<() => void>();

function notify(): void {
  listeners.forEach((listener) => listener());
}

/** Restore a success banner that was queued before a post-import reload. */
function restorePendingSuccess(): void {
  try {
    const raw = sessionStorage.getItem(PENDING_SUCCESS_KEY);
    if (!raw) return;
    sessionStorage.removeItem(PENDING_SUCCESS_KEY);
    const pending = JSON.parse(raw) as {
      message: string | null;
      importedDocuments: number;
      exceedsFreeLimit: boolean;
      visible: boolean;
    };
    snapshot = {
      phase: 'success',
      message: pending.message,
      importedDocuments: pending.importedDocuments,
      exceedsFreeLimit: pending.exceedsFreeLimit,
      visible: pending.visible,
    };
  } catch {
    sessionStorage.removeItem(PENDING_SUCCESS_KEY);
  }
}

restorePendingSuccess();

export function getCloudSyncSnapshot(): CloudSyncSnapshot {
  return snapshot;
}

export function subscribeCloudSyncState(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function setCloudSyncState(next: Partial<CloudSyncSnapshot>): void {
  snapshot = { ...snapshot, ...next };
  notify();
}

export function queueCloudSyncSuccessForReload(input: {
  message: string | null;
  importedDocuments: number;
  exceedsFreeLimit: boolean;
  visible: boolean;
}): void {
  sessionStorage.setItem(PENDING_SUCCESS_KEY, JSON.stringify(input));
}

export function resetCloudSyncState(): void {
  snapshot = {
    phase: 'idle',
    message: null,
    importedDocuments: 0,
    exceedsFreeLimit: false,
    visible: false,
  };
  notify();
}
