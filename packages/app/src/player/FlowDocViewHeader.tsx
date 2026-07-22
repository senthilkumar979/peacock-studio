import { Link } from 'react-router-dom';
import { ArrowLeft, Link2, Pencil } from 'lucide-react';
import { PEACOCK_APP_NAME, PEACOCK_LOGO_SRC } from '@/constants/branding';
import { DASHBOARD_PATH } from '@/constants/routes';
import { HintAnchor, type PageHintControl } from '@/components/onboarding/HintAnchor';
import { PLAYER_HINT_IDS } from '@/constants/firstTimeHints';
import { useDocumentShareModal } from '@/hooks/useDocumentShareModal';
import { useLibraryBackLink } from '@/hooks/useLibraryBackState';
import { SharedViewToggle } from '@/player/SharedViewToggle';
import type { SharedDocumentViewMode } from '@/utils/shareLink';

interface FlowDocViewHeaderProps {
  documentId: string;
  title: string;
  viewMode: SharedDocumentViewMode;
  onViewModeChange: (mode: SharedDocumentViewMode) => void;
  editHref: string;
  editLinkState?: unknown;
  pageHints?: PageHintControl;
}

const actionClass =
  'inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:border-slate-300 hover:bg-slate-50';

export const FlowDocViewHeader = ({
  documentId,
  title,
  viewMode,
  onViewModeChange,
  editHref,
  editLinkState,
  pageHints,
}: FlowDocViewHeaderProps) => {
  const backLink = useLibraryBackLink();
  const { openShare, shareModal } = useDocumentShareModal(documentId);
  const modeLabel = viewMode === 'player' ? 'Player' : 'Guide';

  return (
    <>
      <header className="relative sticky top-0 z-50 shrink-0 border-b border-slate-200/80 bg-white/90 shadow-sm backdrop-blur-xl supports-[backdrop-filter]:bg-white/80">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-peacock-300/50 to-transparent"
        />

        <div className="relative flex items-center justify-between gap-3 px-4 py-2.5 sm:px-5">
          <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
            <Link
              to={backLink.from}
              className={`${actionClass} shrink-0 px-2.5`}
              aria-label={`Back to ${backLink.fromLabel}`}
            >
              <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden />
              <span className="hidden sm:inline">{backLink.fromLabel}</span>
            </Link>

            <div className="hidden h-6 w-px shrink-0 bg-slate-200 sm:block" aria-hidden />

            <Link
              to={DASHBOARD_PATH}
              className="group hidden shrink-0 items-center gap-2 rounded-xl outline-none ring-peacock-500 focus-visible:ring-2 sm:inline-flex"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-peacock-500 to-peacock-700 p-1 shadow-md shadow-peacock-500/20 ring-1 ring-peacock-600/10">
                <img src={PEACOCK_LOGO_SRC} alt="" width={18} height={18} className="h-4 w-4 object-contain" />
              </span>
              <span className="hidden text-sm font-semibold text-slate-900 lg:inline">{PEACOCK_APP_NAME}</span>
            </Link>

            <div className="hidden h-6 w-px shrink-0 bg-slate-200 lg:block" aria-hidden />

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="shrink-0 rounded-full bg-peacock-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-peacock-700 ring-1 ring-peacock-100">
                  {modeLabel}
                </span>
                <h1 className="truncate text-sm font-bold text-slate-900 sm:text-base">{title}</h1>
              </div>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            <HintAnchor
              hints={pageHints}
              hintId={PLAYER_HINT_IDS.viewToggle}
              title="Doc or Player"
              description="Switch between a scrollable guide and a step-by-step player. Share either view with your audience."
            >
              <SharedViewToggle mode={viewMode} onChange={onViewModeChange} />
            </HintAnchor>

            <button type="button" onClick={openShare} className={actionClass}>
              <Link2 className="h-4 w-4 shrink-0" aria-hidden />
              <span className="hidden sm:inline">Share</span>
            </button>

            <HintAnchor
              hints={pageHints}
              hintId={PLAYER_HINT_IDS.editFlow}
              title="Edit this flow"
              description="Jump back to the editor to update steps, branching, and screenshots."
              placement="bottom"
            >
              <Link
                to={editHref}
                state={editLinkState}
                className="inline-flex items-center gap-1.5 rounded-xl border border-peacock-200 bg-peacock-50 px-3 py-2 text-sm font-semibold text-peacock-800 shadow-sm transition hover:bg-peacock-100"
              >
                <Pencil className="h-4 w-4 shrink-0" aria-hidden />
                <span className="hidden sm:inline">Edit</span>
              </Link>
            </HintAnchor>
          </div>
        </div>
      </header>
      {shareModal}
    </>
  );
};
