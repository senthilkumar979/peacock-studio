import type { ReactNode } from 'react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ChevronRight, Link2 } from 'lucide-react';
import { PEACOCK_APP_NAME, PEACOCK_LOGO_SRC } from '@/constants/branding';
import { ShareDocumentModal } from '@/components/share/ShareDocumentModal';
import { ShareRouteModal } from '@/components/share/ShareRouteModal';
import { ShareProductTourModal } from '@/components/share/ShareProductTourModal';
import { persistCurrentFlow } from '@/services/flowLibraryService';
import { useFlowStore } from '@/store/flowStore';
import type { ProductTour } from '@/types/productTour';
import type { SavedRoute } from '@/types/route';

interface AppHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  homeLink?: boolean;
  documentId?: string;
  routeId?: string;
  route?: SavedRoute | null;
  tourId?: string;
  tour?: ProductTour | null;
  children?: ReactNode;
}

const ACTION_CLASS =
  'inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:border-slate-300 hover:bg-slate-50 disabled:opacity-60';

export const AppHeader = ({
  eyebrow,
  title,
  description,
  homeLink = false,
  documentId,
  routeId,
  route,
  tourId,
  tour,
  children,
}: AppHeaderProps) => {
  const flow = useFlowStore((state) => state.flow);
  const outline = useFlowStore((state) => state.steps);
  const screenshotUrls = useFlowStore((state) => state.screenshotUrls);
  const shareSettings = useFlowStore((state) => state.shareSettings);
  const updateShareSettings = useFlowStore((state) => state.updateShareSettings);

  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const canShare = Boolean(documentId || routeId || tourId);
  const hasActions = Boolean(children) || canShare;

  const logoMark = (
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-peacock-500 to-peacock-700 p-1.5 shadow-md shadow-peacock-500/20 ring-1 ring-peacock-600/10 transition-shadow group-hover:shadow-lg group-hover:shadow-peacock-500/25">
      <img
        src={PEACOCK_LOGO_SRC}
        alt={PEACOCK_APP_NAME}
        width={28}
        height={28}
        className="h-7 w-7 object-contain"
      />
    </span>
  );

  const brandBlock = homeLink ? (
    <Link
      to="/"
      className="group flex shrink-0 items-center gap-2.5 rounded-xl outline-none ring-peacock-500 focus-visible:ring-2"
    >
      {logoMark}
      <span className="hidden text-sm font-semibold tracking-tight text-slate-900 sm:inline">
        {PEACOCK_APP_NAME}
      </span>
    </Link>
  ) : (
    <div className="flex shrink-0 items-center gap-2.5">
      {logoMark}
      <span className="hidden text-sm font-semibold tracking-tight text-slate-900 sm:inline">
        {PEACOCK_APP_NAME}
      </span>
    </div>
  );

  const hasContext = Boolean(eyebrow || title || description);

  return (
    <header className="sticky top-0 z-50 shrink-0 border-b border-slate-200/70 bg-white/90 shadow-sm backdrop-blur-lg supports-[backdrop-filter]:bg-white/80">
      <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-3 px-4 py-3 sm:gap-4 sm:px-6">
        <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
          {homeLink ? (
            <Link
              to="/"
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-peacock-500"
              aria-label="Back to dashboard"
            >
              <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden />
              <span className="hidden sm:inline">Dashboard</span>
            </Link>
          ) : null}

          {brandBlock}

          {hasContext ? (
            <>
              <ChevronRight
                className="hidden h-4 w-4 shrink-0 text-slate-300 sm:block"
                aria-hidden
              />
              <div className="min-w-0 flex-1 sm:border-l sm:border-slate-200 sm:pl-3">
                {eyebrow ? (
                  <p className="truncate text-[11px] font-semibold uppercase tracking-wider text-peacock-600">
                    {eyebrow}
                  </p>
                ) : null}
                <h1 className="truncate text-base font-bold leading-tight text-slate-900 sm:text-lg">
                  {title}
                </h1>
                {description ? (
                  <p className="mt-0.5 line-clamp-1 text-xs text-slate-500 sm:text-sm">
                    {description}
                  </p>
                ) : null}
              </div>
            </>
          ) : null}
        </div>

        {hasActions ? (
          <div className="flex shrink-0 flex-wrap items-center justify-end gap-2 sm:border-l sm:border-slate-200 sm:pl-4">
            {canShare ? (
              <button
                type="button"
                onClick={() => setIsShareModalOpen(true)}
                className={ACTION_CLASS}
              >
                <Link2 className="h-4 w-4 shrink-0" aria-hidden />
                Share
              </button>
            ) : null}
            {children}
          </div>
        ) : null}
      </div>

      {documentId ? (
        <ShareDocumentModal
          isOpen={isShareModalOpen}
          documentId={documentId}
          flow={flow}
          steps={outline}
          screenshotUrls={screenshotUrls}
          shareSettings={shareSettings ?? undefined}
          onClose={() => setIsShareModalOpen(false)}
          onShareSettingsSave={(settings) => {
            updateShareSettings(settings);
            void persistCurrentFlow(documentId);
          }}
        />
      ) : null}
      {routeId ? (
        <ShareRouteModal
          isOpen={isShareModalOpen}
          routeId={routeId}
          route={route}
          onClose={() => setIsShareModalOpen(false)}
        />
      ) : null}
      {tourId ? (
        <ShareProductTourModal
          isOpen={isShareModalOpen}
          tourId={tourId}
          tour={tour}
          onClose={() => setIsShareModalOpen(false)}
        />
      ) : null}
    </header>
  );
};
