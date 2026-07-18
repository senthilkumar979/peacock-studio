import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { EyeOff, Sparkles } from 'lucide-react';
import { GuestLibraryIntroModal } from '@/components/dashboard/GuestLibraryIntroModal';
import {
  dismissGuestLibraryIntro,
  isGuestLibraryIntroDismissed,
} from '@/constants/guestLibraryIntro';

interface GuestLibraryHiddenNoticeProps {
  visibleCount: number;
  totalCount: number;
  onIntroSettled?: () => void;
}

export const GuestLibraryHiddenNotice = ({
  visibleCount,
  totalCount,
  onIntroSettled,
}: GuestLibraryHiddenNoticeProps) => {
  const hiddenCount = totalCount - visibleCount;
  const [isIntroOpen, setIsIntroOpen] = useState(false);

  useEffect(() => {
    if (hiddenCount <= 0) {
      setIsIntroOpen(false);
      onIntroSettled?.();
      return;
    }

    if (!isGuestLibraryIntroDismissed()) {
      setIsIntroOpen(true);
      return;
    }

    onIntroSettled?.();
  }, [hiddenCount, onIntroSettled]);

  const handleDismissIntro = () => {
    dismissGuestLibraryIntro();
    setIsIntroOpen(false);
    onIntroSettled?.();
  };

  if (hiddenCount <= 0) return null;

  return (
    <>
      <GuestLibraryIntroModal
        isOpen={isIntroOpen}
        visibleCount={visibleCount}
        totalCount={totalCount}
        onClose={handleDismissIntro}
      />

      <div
        role="status"
        className="mx-5 mb-2 mt-1 overflow-hidden rounded-xl border border-amber-300/80 bg-gradient-to-r from-amber-50 via-orange-50 to-peacock-50 shadow-sm ring-1 ring-amber-200/60"
      >
        <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700 ring-1 ring-amber-200">
              <EyeOff className="h-5 w-5" aria-hidden />
            </div>
            <div className="min-w-0">
              <p className="text-base font-bold text-slate-900">
                {hiddenCount} recording{hiddenCount === 1 ? ' is' : 's are'} hidden from this list
              </p>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-700">
                Showing {visibleCount} of {totalCount} on this device.{' '}
                <button
                  type="button"
                  onClick={() => setIsIntroOpen(true)}
                  className="font-semibold text-peacock-700 underline-offset-2 hover:underline"
                >
                  Why?
                </button>
              </p>
            </div>
          </div>

          <div className="flex shrink-0 flex-col gap-2 sm:items-end">
            <Link
              to="/sign-up"
              className="btn-peacock inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm"
            >
              <Sparkles className="h-4 w-4" aria-hidden />
              Sign up to see all {totalCount}
            </Link>
            <Link
              to="/sign-in"
              className="text-center text-sm font-medium text-peacock-700 hover:text-peacock-800"
            >
              Already have an account? Sign in
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};
