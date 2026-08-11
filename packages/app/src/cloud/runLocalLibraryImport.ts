import {
  cloudLibraryIsEmpty,
  countLocalLibraryItems,
  dismissLocalImportPrompt,
  hasCompletedLocalImport,
  importLocalLibraryToCloud,
  localLibraryNeedsCloudImport,
  markLocalImportComplete,
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
 *
 * Runs when the cloud library has no docs/tours, or when local still has
 * document/tour ids missing from cloud (recovers stranded guest libraries).
 */
export async function runLocalLibraryImport(options: {
  createdAt: Date | number | null | undefined;
  isCancelled?: () => boolean;
}): Promise<LocalLibraryImportOutcome> {
  const local = await countLocalLibraryItems();
  const hasLocalContent = local.documents > 0 || local.tours > 0;

  if (!hasLocalContent) {
    dismissLocalImportPrompt();
    return { status: 'skipped' };
  }

  const cloudEmpty = await cloudLibraryIsEmpty();
  const needsImport = cloudEmpty || (await localLibraryNeedsCloudImport());

  if (!needsImport) {
    // Local copies already exist in cloud — drop IndexedDB and mark done.
    await clearLocalLibrary();
    markLocalImportComplete();
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

/** Whether the post-login runner should attempt import (including recovery). */
export async function shouldRunLocalLibraryImport(): Promise<boolean> {
  if (await localLibraryNeedsCloudImport()) return true;
  if (hasCompletedLocalImport()) return false;

  const local = await countLocalLibraryItems();
  // Prior dismiss/incomplete with local docs/tours still present — reconcile or clear.
  return local.documents > 0 || local.tours > 0;
}
