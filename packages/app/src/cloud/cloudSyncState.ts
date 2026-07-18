export type CloudSyncPhase = 'idle' | 'syncing' | 'success' | 'error';

export interface CloudSyncSnapshot {
  phase: CloudSyncPhase;
  message: string | null;
  importedDocuments: number;
  exceedsFreeLimit: boolean;
}

let snapshot: CloudSyncSnapshot = {
  phase: 'idle',
  message: null,
  importedDocuments: 0,
  exceedsFreeLimit: false,
};

const listeners = new Set<() => void>();

function notify(): void {
  listeners.forEach((listener) => listener());
}

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

export function resetCloudSyncState(): void {
  snapshot = {
    phase: 'idle',
    message: null,
    importedDocuments: 0,
    exceedsFreeLimit: false,
  };
  notify();
}
