import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { X } from 'lucide-react';
import { trackEvent } from '@/analytics/analyticsClient';
import { AnalyticsEvents } from '@/analytics/events';
import {
  getFreeAccountDocLimit,
  getFreeAccountStorageBytesLimit,
} from '@/cloud/planLimits';
import { PRICING_PATH } from '@/constants/routes';
import { formatBytes } from '@/utils/formatBytes';

interface UpgradeAccountModalProps {
  isOpen: boolean;
  importedCount: number;
  onClose: () => void;
}

export const UpgradeAccountModal = ({
  isOpen,
  importedCount,
  onClose,
}: UpgradeAccountModalProps) => {
  if (!isOpen) return null;

  const freeDocLimit = getFreeAccountDocLimit();
  const freeStorageLabel = formatBytes(getFreeAccountStorageBytesLimit());

  return createPortal(
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close upgrade dialog"
        className="absolute inset-0 bg-slate-900/50"
        onClick={onClose}
      />
      <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-2 hover:bg-slate-100"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
        <h2 className="text-lg font-bold text-slate-900">Upgrade to keep your full library</h2>
        <p className="mt-2 text-sm text-slate-600">
          We synced {importedCount} document{importedCount === 1 ? '' : 's'} from this device. Your
          free plan includes up to {freeDocLimit} documents and {freeStorageLabel} of screenshot
          storage in the cloud — these are separate limits.
        </p>
        <p className="mt-3 text-sm text-slate-600">
          Upgrade to Pro to keep unlimited documentation, higher storage, advanced sharing, and team
          features. During beta, see what&apos;s included on the pricing page.
        </p>
        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <Link
            to={PRICING_PATH}
            onClick={() => {
              trackEvent(AnalyticsEvents.betaPricingInterest, {
                surface: 'upgrade_modal_continue_free',
              });
              onClose();
            }}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Continue on free plan
          </Link>
          <Link
            to={PRICING_PATH}
            onClick={() => {
              trackEvent(AnalyticsEvents.betaPricingInterest, {
                surface: 'upgrade_modal_view_pricing',
              });
              onClose();
            }}
            className="rounded-lg bg-peacock-600 px-4 py-2 text-sm font-semibold text-white hover:bg-peacock-700"
          >
            View pricing
          </Link>
        </div>
      </div>
    </div>,
    document.body,
  );
};
