import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cloud, Sparkles } from 'lucide-react';
import { useSyncExternalStore } from 'react';
import {
  getCloudSyncSnapshot,
  subscribeCloudSyncState,
  setCloudSyncState,
} from '@/cloud/cloudSyncState';
import { UpgradeAccountModal } from '@/components/auth/UpgradeAccountModal';

export const CloudSyncBanner = () => {
  const snapshot = useSyncExternalStore(subscribeCloudSyncState, getCloudSyncSnapshot);
  const [showUpgrade, setShowUpgrade] = useState(false);

  useEffect(() => {
    if (snapshot.phase === 'success' && snapshot.exceedsFreeLimit) {
      setShowUpgrade(true);
    }
  }, [snapshot.phase, snapshot.exceedsFreeLimit]);

  const dismissSuccess = () => {
    setCloudSyncState({ phase: 'idle', message: null, visible: false });
  };

  const showSyncing = snapshot.visible && snapshot.phase === 'syncing';
  const showSuccess =
    snapshot.visible && snapshot.phase === 'success' && snapshot.importedDocuments > 0;
  const showError = snapshot.visible && snapshot.phase === 'error' && Boolean(snapshot.message);

  return (
    <>
      <AnimatePresence>
        {showSyncing ? (
          <motion.div
            key="syncing"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="fixed inset-x-0 top-0 z-[70] border-b border-peacock-200/80 bg-gradient-to-r from-peacock-600 via-peacock-700 to-brand-violet px-4 py-3 text-white shadow-lg"
          >
            <div className="mx-auto flex max-w-3xl items-center justify-center gap-3">
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              >
                <Cloud className="h-5 w-5" aria-hidden />
              </motion.span>
              <p className="text-sm font-medium">{snapshot.message ?? 'Syncing to cloud…'}</p>
              <motion.span
                className="inline-flex gap-1"
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1.2, repeat: Infinity }}
              >
                <Sparkles className="h-4 w-4" aria-hidden />
              </motion.span>
            </div>
          </motion.div>
        ) : null}

        {showSuccess ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="fixed inset-x-0 top-0 z-[70] border-b border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-900 shadow-sm"
          >
            <div className="mx-auto flex max-w-3xl items-center justify-between gap-3">
              <p className="text-sm font-medium">{snapshot.message}</p>
              <button
                type="button"
                onClick={dismissSuccess}
                className="shrink-0 rounded-lg px-3 py-1 text-xs font-semibold text-emerald-800 hover:bg-emerald-100"
              >
                Dismiss
              </button>
            </div>
          </motion.div>
        ) : null}

        {showError ? (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="fixed inset-x-0 top-0 z-[70] border-b border-red-200 bg-red-50 px-4 py-3 text-red-800"
          >
            <p className="mx-auto max-w-3xl text-center text-sm font-medium">{snapshot.message}</p>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <UpgradeAccountModal
        isOpen={showUpgrade}
        importedCount={snapshot.importedDocuments}
        onClose={() => setShowUpgrade(false)}
      />
    </>
  );
};
