import { beforeEach, describe, expect, it, vi } from 'vitest';

const countLocalLibraryItems = vi.fn();
const cloudLibraryIsEmpty = vi.fn();
const localLibraryNeedsCloudImport = vi.fn();
const dismissLocalImportPrompt = vi.fn();
const markLocalImportComplete = vi.fn();
const hasCompletedLocalImport = vi.fn();
const importLocalLibraryToCloud = vi.fn();
const getFreeAccountDocLimit = vi.fn(() => 10);
const setCloudSyncState = vi.fn();
const queueCloudSyncSuccessForReload = vi.fn();
const resetCloudSyncState = vi.fn();
const clearLocalLibrary = vi.fn();
const reportAppError = vi.fn((title: string) => ({
  title,
  userMessage: 'failed import',
}));
const notifyError = vi.fn();
const trackEvent = vi.fn();

vi.mock('@/cloud/importLocalLibrary', () => ({
  countLocalLibraryItems: (...args: any[]) => (countLocalLibraryItems as any)(...args),
  cloudLibraryIsEmpty: (...args: any[]) => (cloudLibraryIsEmpty as any)(...args),
  localLibraryNeedsCloudImport: (...args: any[]) => (localLibraryNeedsCloudImport as any)(...args),
  dismissLocalImportPrompt: (...args: any[]) => (dismissLocalImportPrompt as any)(...args),
  markLocalImportComplete: (...args: any[]) => (markLocalImportComplete as any)(...args),
  hasCompletedLocalImport: (...args: any[]) => (hasCompletedLocalImport as any)(...args),
  importLocalLibraryToCloud: (...args: any[]) => (importLocalLibraryToCloud as any)(...args),
}));

vi.mock('@/cloud/planLimits', () => ({
  getFreeAccountDocLimit: () => getFreeAccountDocLimit(),
}));

vi.mock('@/cloud/cloudSyncState', () => ({
  setCloudSyncState: (...args: any[]) => (setCloudSyncState as any)(...args),
  queueCloudSyncSuccessForReload: (...args: any[]) => (queueCloudSyncSuccessForReload as any)(...args),
  resetCloudSyncState: (...args: any[]) => (resetCloudSyncState as any)(...args),
}));

vi.mock('@/storage/flowLibraryDb', () => ({
  clearLocalLibrary: (...args: any[]) => (clearLocalLibrary as any)(...args),
}));

vi.mock('@/utils/appError', () => ({
  reportAppError: (...args: any[]) => (reportAppError as any)(...args),
}));

vi.mock('@/utils/notify', () => ({
  notifyError: (...args: any[]) => (notifyError as any)(...args),
}));

vi.mock('@/analytics/analyticsClient', () => ({
  trackEvent: (...args: any[]) => (trackEvent as any)(...args),
}));

vi.mock('@/analytics/events', () => ({
  AnalyticsEvents: { localLibraryImported: 'local_library_imported' },
}));

import {
  isRecentSignup,
  runLocalLibraryImport,
  shouldRunLocalLibraryImport,
} from './runLocalLibraryImport';

describe('runLocalLibraryImport', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    countLocalLibraryItems.mockResolvedValue({ documents: 2, personas: 1, tours: 1 });
    cloudLibraryIsEmpty.mockResolvedValue(true);
    localLibraryNeedsCloudImport.mockResolvedValue(true);
    importLocalLibraryToCloud.mockResolvedValue({ documents: 2, personas: 1, tours: 1 });
    clearLocalLibrary.mockResolvedValue(undefined);
    getFreeAccountDocLimit.mockReturnValue(10);
  });

  it('isRecentSignup checks window', () => {
    expect(isRecentSignup(null)).toBe(false);
    expect(isRecentSignup(Date.now())).toBe(true);
    expect(isRecentSignup(Date.now() - 31 * 60 * 1000)).toBe(false);
    expect(isRecentSignup(Number.NaN)).toBe(false);
  });

  it('skips when no local content', async () => {
    countLocalLibraryItems.mockResolvedValue({ documents: 0, personas: 0, tours: 0 });
    await expect(runLocalLibraryImport({ createdAt: Date.now() })).resolves.toEqual({
      status: 'skipped',
    });
    expect(dismissLocalImportPrompt).toHaveBeenCalled();
  });

  it('clears local when nothing missing', async () => {
    cloudLibraryIsEmpty.mockResolvedValue(false);
    localLibraryNeedsCloudImport.mockResolvedValue(false);
    await expect(runLocalLibraryImport({ createdAt: Date.now() })).resolves.toEqual({
      status: 'skipped',
    });
    expect(clearLocalLibrary).toHaveBeenCalled();
    expect(markLocalImportComplete).toHaveBeenCalled();
  });

  it('imports with visible progress for recent signup', async () => {
    const result = await runLocalLibraryImport({ createdAt: Date.now() });
    expect(result).toEqual({
      status: 'imported',
      counts: { documents: 2, personas: 1, tours: 1 },
      showProgress: true,
    });
    expect(setCloudSyncState).toHaveBeenCalledWith(
      expect.objectContaining({ phase: 'syncing', visible: true }),
    );
    expect(queueCloudSyncSuccessForReload).toHaveBeenCalledWith(
      expect.objectContaining({ importedDocuments: 2, visible: true }),
    );
    expect(trackEvent).toHaveBeenCalled();
  });

  it('queues silent exceed limit when not showing progress', async () => {
    countLocalLibraryItems.mockResolvedValue({ documents: 0, personas: 0, tours: 1 });
    importLocalLibraryToCloud.mockResolvedValue({ documents: 12, personas: 0, tours: 1 });
    getFreeAccountDocLimit.mockReturnValue(10);

    await runLocalLibraryImport({ createdAt: Date.now() - 31 * 60 * 1000 });
    expect(queueCloudSyncSuccessForReload).toHaveBeenCalledWith(
      expect.objectContaining({ exceedsFreeLimit: true, visible: false }),
    );
  });

  it('handles cancel mid-run and import errors', async () => {
    await expect(
      runLocalLibraryImport({ createdAt: Date.now(), isCancelled: () => true }),
    ).resolves.toEqual({ status: 'skipped' });

    importLocalLibraryToCloud.mockRejectedValue(new Error('boom'));
    await expect(runLocalLibraryImport({ createdAt: Date.now() })).resolves.toEqual({
      status: 'error',
      showProgress: true,
    });
    expect(setCloudSyncState).toHaveBeenCalledWith(
      expect.objectContaining({ phase: 'error' }),
    );

    countLocalLibraryItems.mockResolvedValue({ documents: 0, personas: 0, tours: 1 });
    await expect(
      runLocalLibraryImport({ createdAt: Date.now() - 31 * 60 * 1000 }),
    ).resolves.toEqual({ status: 'error', showProgress: false });
    expect(notifyError).toHaveBeenCalled();
    expect(resetCloudSyncState).toHaveBeenCalled();
  });

  it('shouldRunLocalLibraryImport covers recovery paths', async () => {
    localLibraryNeedsCloudImport.mockResolvedValue(true);
    await expect(shouldRunLocalLibraryImport()).resolves.toBe(true);

    localLibraryNeedsCloudImport.mockResolvedValue(false);
    hasCompletedLocalImport.mockReturnValue(true);
    await expect(shouldRunLocalLibraryImport()).resolves.toBe(false);

    hasCompletedLocalImport.mockReturnValue(false);
    countLocalLibraryItems.mockResolvedValue({ documents: 1, personas: 0, tours: 0 });
    await expect(shouldRunLocalLibraryImport()).resolves.toBe(true);
  });
});
