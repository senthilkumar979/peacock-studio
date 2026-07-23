import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@clerk/react';
import { isCloudLibraryActive } from '@/cloud/authContext';
import {
  cloudLibraryIsEmpty,
  countLocalLibraryItems,
  dismissLocalImportPrompt,
  hasCompletedLocalImport,
  importLocalLibraryToCloud,
  type LocalLibraryImportCounts,
} from '@/cloud/importLocalLibrary';
import { isCloudSyncEnabled } from '@/cloud/config';
import { reportAppError } from '@/utils/appError';
import { notifyPromise } from '@/utils/notify';
import { AnalyticsEvents } from '@/analytics/events';

const ImportLocalLibraryPromptInner = () => {
  const { isSignedIn } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [localCounts, setLocalCounts] = useState<LocalLibraryImportCounts | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const evaluatePrompt = useCallback(async () => {
    if (!isSignedIn || !isCloudLibraryActive()) return;
    if (hasCompletedLocalImport()) return;

    const local = await countLocalLibraryItems();
    const hasLocalData =
      local.documents > 0 || local.personas > 0 || local.tours > 0;

    if (!hasLocalData) {
      dismissLocalImportPrompt();
      return;
    }

    const cloudEmpty = await cloudLibraryIsEmpty();
    if (!cloudEmpty) {
      dismissLocalImportPrompt();
      return;
    }

    setLocalCounts(local);
    setIsOpen(true);
  }, [isSignedIn]);

  useEffect(() => {
    void evaluatePrompt();
  }, [evaluatePrompt]);

  const handleImport = async () => {
    setIsImporting(true);
    setError(null);
    try {
      await notifyPromise(importLocalLibraryToCloud(), {
        loading: 'Importing local library…',
        success: 'Library imported',
        successDescription: 'Reloading so your cloud library is ready.',
        context: 'Import local library to cloud',
        event: AnalyticsEvents.localLibraryImported,
      });
      setIsOpen(false);
      window.location.reload();
    } catch (importError) {
      const classified = reportAppError('Local library import failed', importError);
      setError(classified.userMessage);
    } finally {
      setIsImporting(false);
    }
  };

  const handleDismiss = () => {
    dismissLocalImportPrompt();
    setIsOpen(false);
  };

  if (!isOpen || !localCounts) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Dismiss import dialog backdrop"
        className="absolute inset-0 bg-slate-900/50"
        onClick={handleDismiss}
      />
      <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl ring-1 ring-slate-900/5">
        <h2 className="text-lg font-semibold text-slate-900">Import local library?</h2>
        <p className="mt-2 text-sm text-slate-600">
          We found items saved in this browser. Import them to your cloud workspace so they
          sync across devices.
        </p>
        <ul className="mt-4 space-y-1 text-sm text-slate-700">
          <li>{localCounts.documents} flow document{localCounts.documents === 1 ? '' : 's'}</li>
          <li>{localCounts.personas} persona{localCounts.personas === 1 ? '' : 's'}</li>
          <li>{localCounts.tours} product tour{localCounts.tours === 1 ? '' : 's'}</li>
        </ul>
        {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={handleDismiss}
            disabled={isImporting}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
          >
            Not now
          </button>
          <button
            type="button"
            onClick={() => void handleImport()}
            disabled={isImporting}
            className="btn-peacock disabled:opacity-60"
          >
            {isImporting ? 'Importing…' : 'Import to cloud'}
          </button>
        </div>
      </div>
    </div>
  );
};

export const ImportLocalLibraryPrompt = () => {
  if (!isCloudSyncEnabled()) return null;

  return <ImportLocalLibraryPromptInner />;
};
