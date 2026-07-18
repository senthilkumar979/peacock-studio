import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { EyeOff, Sparkles, X } from 'lucide-react';
import { getGuestVisibleDocLimit } from '@/cloud/planLimits';

interface GuestLibraryIntroModalProps {
  isOpen: boolean;
  visibleCount: number;
  totalCount: number;
  onClose: () => void;
}

export const GuestLibraryIntroModal = ({
  isOpen,
  visibleCount,
  totalCount,
  onClose,
}: GuestLibraryIntroModalProps) => {
  if (!isOpen) return null;

  const hiddenCount = totalCount - visibleCount;
  const previewLimit = getGuestVisibleDocLimit();

  return createPortal(
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-slate-900/55 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="guest-library-intro-title"
        className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-2 text-slate-500 hover:bg-slate-100"
          aria-label="Close dialog"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
          <EyeOff className="h-6 w-6" aria-hidden />
        </div>

        <h2 id="guest-library-intro-title" className="mt-4 text-xl font-bold text-slate-900">
          Some recordings are hidden
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          You have <strong>{totalCount}</strong> recording{totalCount === 1 ? '' : 's'} saved on
          this device. While browsing without an account, Peacock only shows your{' '}
          <strong>oldest {previewLimit}</strong>.
        </p>

        <ul className="mt-4 space-y-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
          <li>
            <span className="font-semibold text-slate-900">Visible now:</span> {visibleCount}{' '}
            recording{visibleCount === 1 ? '' : 's'}
          </li>
          <li>
            <span className="font-semibold text-slate-900">Hidden:</span> {hiddenCount} newer
            recording{hiddenCount === 1 ? '' : 's'}
          </li>
        </ul>

        <p className="mt-4 text-sm text-slate-600">
          Create a free account to unlock your full library, sync across devices, and keep every
          recording in the cloud.
        </p>

        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Got it
          </button>
          <Link
            to="/sign-up"
            className="btn-peacock inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm"
          >
            <Sparkles className="h-4 w-4" aria-hidden />
            Sign up free
          </Link>
        </div>
      </div>
    </div>,
    document.body,
  );
};
