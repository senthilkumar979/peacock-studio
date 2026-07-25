import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { PEACOCK_APP_NAME, PEACOCK_LOGO_SRC } from '@/constants/branding';
import { useLibraryBackLink } from '@/hooks/useLibraryBackState';

export const FLOW_DOC_ACTION_CLASS =
  'inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:border-slate-300 hover:bg-slate-50';

export const FLOW_DOC_PRIMARY_ACTION_CLASS =
  'inline-flex items-center gap-1.5 rounded-xl border border-peacock-200 bg-peacock-50 px-3 py-2 text-sm font-semibold text-peacock-800 shadow-sm transition hover:bg-peacock-100';

type ModeBadgeTone = 'peacock' | 'slate';

interface FlowDocChromeHeaderProps {
  title: string;
  /** Shown next to the title when set (e.g. flow doc version). */
  version?: string | null;
  modeBadge?: {
    label: string;
    tone?: ModeBadgeTone;
  };
  /** When false, hides the library back control. Defaults to true. */
  showBack?: boolean;
  /** Destination for the logo / brand mark. */
  homeTo: string;
  actions?: ReactNode;
  /** Sets `data-flow-doc-sticky-header` for sticky-offset consumers (e.g. guide view). */
  stickyHeaderMarker?: boolean;
  /** When set, replaces the peacock hairline with a reading progress bar. */
  guideProgressPercent?: number;
}

const MODE_BADGE_TONES: Record<ModeBadgeTone, string> = {
  peacock:
    'bg-peacock-50 text-peacock-700 ring-peacock-100',
  slate: 'bg-slate-100 text-slate-600 ring-slate-200',
};

export const FlowDocChromeHeader = ({
  title,
  version,
  modeBadge,
  showBack = true,
  homeTo,
  actions,
  stickyHeaderMarker = false,
  guideProgressPercent,
}: FlowDocChromeHeaderProps) => {
  const backLink = useLibraryBackLink();
  const badgeTone = modeBadge?.tone ?? 'peacock';
  const versionLabel = version?.trim() || null;

  return (
    <header
      {...(stickyHeaderMarker ? { 'data-flow-doc-sticky-header': true } : {})}
      className="relative sticky top-0 z-50 shrink-0 border-b border-slate-200/80 bg-white/90 shadow-sm backdrop-blur-xl supports-[backdrop-filter]:bg-white/80"
    >
      <div className="relative flex items-center justify-between gap-3 px-4 py-2.5 sm:px-5">
        <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
          {showBack ? (
            <>
              <Link
                to={backLink.from}
                className={`${FLOW_DOC_ACTION_CLASS} shrink-0 px-2.5`}
                aria-label={`Back to ${backLink.fromLabel}`}
              >
                <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden />
                <span className="hidden sm:inline">{backLink.fromLabel}</span>
              </Link>

              <div className="hidden h-6 w-px shrink-0 bg-slate-200 sm:block" aria-hidden />
            </>
          ) : null}

          <Link
            to={homeTo}
            className="group hidden shrink-0 items-center gap-2 rounded-xl outline-none ring-peacock-500 focus-visible:ring-2 sm:inline-flex"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-peacock-500 to-peacock-700 p-1 shadow-md shadow-peacock-500/20 ring-1 ring-peacock-600/10">
              <img src={PEACOCK_LOGO_SRC} alt="" width={18} height={18} className="h-4 w-4 object-contain" />
            </span>
            <span className="hidden text-sm font-semibold text-slate-900 lg:inline">{PEACOCK_APP_NAME}</span>
          </Link>

          <div className="hidden h-6 w-px shrink-0 bg-slate-200 lg:block" aria-hidden />

          <div className="min-w-0">
            <div className="flex min-w-0 items-center gap-2">
              {modeBadge ? (
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] ring-1 ${MODE_BADGE_TONES[badgeTone]}`}
                >
                  {modeBadge.label}
                </span>
              ) : null}
              <h1 className="truncate text-sm font-bold text-slate-900 sm:text-base">{title}</h1>
              {versionLabel ? (
                <span
                  className="shrink-0 rounded-md bg-slate-100 px-1.5 py-0.5 text-[11px] font-medium tabular-nums text-slate-600 ring-1 ring-slate-200/80"
                  title={`Version ${versionLabel}`}
                >
                  v{versionLabel}
                </span>
              ) : null}
            </div>
          </div>
        </div>

        {actions ? (
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">{actions}</div>
        ) : null}
      </div>

      {guideProgressPercent !== undefined ? (
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-1 bg-slate-100"
          role="progressbar"
          aria-valuenow={guideProgressPercent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Guide reading progress"
        >
          <div
            className="h-full rounded-r-full bg-gradient-to-r from-peacock-500 to-brand-violet transition-[width] duration-300 ease-out"
            style={{ width: `${guideProgressPercent}%` }}
          />
        </div>
      ) : (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-peacock-300/50 to-transparent"
        />
      )}
    </header>
  );
};
