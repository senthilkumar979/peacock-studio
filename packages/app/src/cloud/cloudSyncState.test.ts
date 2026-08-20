import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('cloudSyncState', () => {
  beforeEach(() => {
    sessionStorage.clear();
    vi.resetModules();
  });

  it('restores pending success from sessionStorage on load', async () => {
    sessionStorage.setItem(
      'peacock-cloud-sync-pending-success',
      JSON.stringify({
        message: 'done',
        importedDocuments: 2,
        exceedsFreeLimit: true,
        visible: true,
      }),
    );
    const {
      getCloudSyncSnapshot,
      resetCloudSyncState,
      setCloudSyncState,
      subscribeCloudSyncState,
      queueCloudSyncSuccessForReload,
    } = await import('./cloudSyncState');

    expect(getCloudSyncSnapshot()).toMatchObject({
      phase: 'success',
      message: 'done',
      importedDocuments: 2,
      exceedsFreeLimit: true,
      visible: true,
    });
    expect(sessionStorage.getItem('peacock-cloud-sync-pending-success')).toBeNull();

    const listener = vi.fn();
    const unsub = subscribeCloudSyncState(listener);
    setCloudSyncState({ phase: 'syncing', message: 'working' });
    expect(getCloudSyncSnapshot().phase).toBe('syncing');
    expect(listener).toHaveBeenCalled();

    queueCloudSyncSuccessForReload({
      message: 'queued',
      importedDocuments: 1,
      exceedsFreeLimit: false,
      visible: false,
    });
    expect(sessionStorage.getItem('peacock-cloud-sync-pending-success')).toContain('queued');

    resetCloudSyncState();
    expect(getCloudSyncSnapshot().phase).toBe('idle');
    unsub();
  });

  it('clears corrupt pending success payload', async () => {
    sessionStorage.setItem('peacock-cloud-sync-pending-success', '{bad');
    const { getCloudSyncSnapshot } = await import('./cloudSyncState');
    expect(getCloudSyncSnapshot().phase).toBe('idle');
    expect(sessionStorage.getItem('peacock-cloud-sync-pending-success')).toBeNull();
  });
});
