import {
  cloudLibraryIsEmpty,
  countLocalLibraryItems,
  dismissLocalImportPrompt,
  importLocalLibraryToCloud,
  type LocalLibraryImportCounts,
} from '@/cloud/importLocalLibrary';
import { getFreeAccountDocLimit } from '@/cloud/planLimits';
import {
  queueCloudSyncSuccessForReload,
  resetCloudSyncState,
  setCloudSyncState,
} from '@/cloud/cloudSyncState';
import { clearLocalLibrary } from '@/storage/flowLibraryDb';
import { reportAppError } from '@/utils/appError';
import { notifyError } from '@/utils/notify';
import { trackEvent } from '@/analytics/analyticsClient';
import { AnalyticsEvents } from '@/analytics/events';

/** Accounts created within this window are treated as signup for sync UI. */
export const RECENT_SIGNUP_WINDOW_MS = 30 * 60 * 1000;

export function isRecentSignup(createdAt: Date | number | null | undefined): boolean {
  if (createdAt == null) return false;
  const createdMs = typeof createdAt === 'number' ? createdAt : createdAt.getTime();
  if (!Number.isFinite(createdMs)) return false;
  return Date.now() - createdMs < RECENT_SIGNUP_WINDOW_MS;
}

export type LocalLibraryImportOutcome =
  | { status: 'skipped' }
  | { status: 'imported'; counts: LocalLibraryImportCounts; showProgress: boolean }
  | { status: 'error'; showProgress: boolean };

/**
 * Import guest IndexedDB library into the active cloud workspace.
 * Visible banner only when `showProgress` (recent signup + prior flow docs).
 */
export async function runLocalLibraryImport(options: {
  createdAt: Date | number | null | undefined;
  isCancelled?: () => boolean;
}): Promise<LocalLibraryImportOutcome> {
  const local = await countLocalLibraryItems();
  const hasLocalData = local.documents > 0 || local.personas > 0 || local.tours > 0;

  if (!hasLocalData) {
    dismissLocalImportPrompt();
    return { status: 'skipped' };
  }

  const cloudEmpty = await cloudLibraryIsEmpty();
  if (!cloudEmpty) {
    dismissLocalImportPrompt();
    return { status: 'skipped' };
  }

  if (options.isCancelled?.()) return { status: 'skipped' };

  const showProgress = isRecentSignup(options.createdAt) && local.documents > 0;

  try {
    if (showProgress) {
      setCloudSyncState({
        phase: 'syncing',
        message: 'Syncing your library to the cloud…',
        importedDocuments: 0,
        exceedsFreeLimit: false,
        visible: true,
      });
    }

    const counts = await importLocalLibraryToCloud();
    await clearLocalLibrary();
    if (options.isCancelled?.()) return { status: 'skipped' };

    const exceedsFreeLimit = counts.documents > getFreeAccountDocLimit();
    trackEvent(AnalyticsEvents.localLibraryImported, {
      documents: counts.documents,
      personas: counts.personas,
      tours: counts.tours,
      visible: showProgress,
    });

    if (showProgress && counts.documents > 0) {
      queueCloudSyncSuccessForReload({
        message: `Synced ${counts.documents} document${counts.documents === 1 ? '' : 's'} to your cloud library.`,
        importedDocuments: counts.documents,
        exceedsFreeLimit,
        visible: true,
      });
    } else if (exceedsFreeLimit) {
      queueCloudSyncSuccessForReload({
        message: null,
        importedDocuments: counts.documents,
        exceedsFreeLimit: true,
        visible: false,
      });
    }

    return { status: 'imported', counts, showProgress };
  } catch (importError) {
    const classified = reportAppError('Local library import failed', importError);
    if (showProgress) {
      setCloudSyncState({
        phase: 'error',
        message: classified.userMessage,
        importedDocuments: 0,
        exceedsFreeLimit: false,
        visible: true,
      });
    } else {
      notifyError(classified.title, classified.userMessage);
      resetCloudSyncState();
    }
    return { status: 'error', showProgress };
  }
}
