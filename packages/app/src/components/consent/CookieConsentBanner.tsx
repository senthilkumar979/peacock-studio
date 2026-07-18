import { Cookie } from 'lucide-react';
import { useConsent } from '@/hooks/useConsent';
import { useConsentStore } from '@/store/consentStore';

export const CookieConsentBanner = () => {
  const { isBannerVisible } = useConsent();
  const acceptAll = useConsentStore((state) => state.acceptAll);
  const rejectNonEssential = useConsentStore((state) => state.rejectNonEssential);
  const openPreferences = useConsentStore((state) => state.openPreferences);

  if (!isBannerVisible) return null;

  return (
    <div
      role="region"
      aria-label="Cookie consent"
      className="fixed inset-x-0 bottom-0 z-50 p-4"
    >
      <div className="mx-auto flex max-w-4xl flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl shadow-slate-400/30 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <Cookie className="mt-0.5 h-5 w-5 shrink-0 text-peacock-600" aria-hidden />
          <p className="text-sm text-slate-600">
            Peacock uses strictly necessary storage to run, and — only with your
            permission — analytics to improve the product. You can change this
            anytime from the footer.
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={openPreferences}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Manage preferences
          </button>
          <button
            type="button"
            onClick={rejectNonEssential}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Reject non-essential
          </button>
          <button
            type="button"
            onClick={acceptAll}
            className="btn-peacock btn-peacock--sm"
          >
            Accept all
          </button>
        </div>
      </div>
    </div>
  );
};
