import { Link } from 'react-router-dom';
import { LayoutGrid, Link2, Maximize2, Pencil } from 'lucide-react';
import { DASHBOARD_PATH, LANDING_PATH } from '@/constants/routes';
import {
  FLOW_DOC_ACTION_CLASS,
  FLOW_DOC_PRIMARY_ACTION_CLASS,
  FlowDocChromeHeader,
} from '@/components/flow/FlowDocChromeHeader';
import { HintAnchor, type PageHintControl } from '@/components/onboarding/HintAnchor';
import { ActionTooltip } from '@/components/ui/ActionTooltip';
import { PLAYER_HINT_IDS } from '@/constants/firstTimeHints';
import { useDocumentShareModal } from '@/hooks/useDocumentShareModal';
import { SharedViewToggle } from '@/player/SharedViewToggle';
import type { SharedDocumentViewMode } from '@/utils/shareLink';

interface FlowDocViewHeaderProps {
  documentId: string;
  title: string;
  version?: string | null;
  viewMode: SharedDocumentViewMode;
  onViewModeChange: (mode: SharedDocumentViewMode) => void;
  onOverview?: () => void;
  editHref: string;
  editLinkState?: unknown;
  pageHints?: PageHintControl;
  showOwnerActions?: boolean;
  guideProgressPercent?: number;
  isEmbed?: boolean;
  onEnterPresenter?: () => void;
}

export const FlowDocViewHeader = ({
  documentId,
  title,
  version,
  viewMode,
  onViewModeChange,
  onOverview,
  editHref,
  editLinkState,
  pageHints,
  showOwnerActions = true,
  guideProgressPercent,
  isEmbed = false,
  onEnterPresenter,
}: FlowDocViewHeaderProps) => {
  const { openShare, shareModal } = useDocumentShareModal(documentId);
  const modeLabel = viewMode === 'player' ? 'Player' : 'Guide';
  const showChromeNav = showOwnerActions && !isEmbed;

  return (
    <>
      <FlowDocChromeHeader
        title={title}
        version={version}
        modeBadge={!isEmbed ? { label: modeLabel, tone: 'peacock' } : undefined}
        showBack={showChromeNav}
        homeTo={showChromeNav ? DASHBOARD_PATH : LANDING_PATH}
        stickyHeaderMarker
        guideProgressPercent={guideProgressPercent}
        actions={
          <>
            {onOverview && !isEmbed ? (
              <ActionTooltip label="Overview">
                <button
                  type="button"
                  onClick={onOverview}
                  className={FLOW_DOC_ACTION_CLASS}
                  aria-label="Overview"
                >
                  <LayoutGrid className="h-4 w-4 shrink-0" aria-hidden />
                  <span className="hidden sm:inline">Overview</span>
                </button>
              </ActionTooltip>
            ) : null}

            {viewMode === 'player' && onEnterPresenter ? (
              <ActionTooltip label="Presenter mode (fullscreen)">
                <button
                  type="button"
                  onClick={onEnterPresenter}
                  className={FLOW_DOC_ACTION_CLASS}
                  aria-label="Presenter mode"
                >
                  <Maximize2 className="h-4 w-4 shrink-0" aria-hidden />
                  <span className="hidden sm:inline">Presenter</span>
                </button>
              </ActionTooltip>
            ) : null}

            {!isEmbed ? (
              <HintAnchor
                hints={pageHints}
                hintId={PLAYER_HINT_IDS.viewToggle}
                title="Doc or Player"
                description="Switch between a scrollable guide and a step-by-step player. Share either view with your audience."
              >
                <SharedViewToggle mode={viewMode} onChange={onViewModeChange} />
              </HintAnchor>
            ) : null}

            {showOwnerActions && !isEmbed ? (
              <>
                <ActionTooltip label="Share">
                  <button
                    type="button"
                    onClick={openShare}
                    className={FLOW_DOC_ACTION_CLASS}
                    aria-label="Share"
                  >
                    <Link2 className="h-4 w-4 shrink-0" aria-hidden />
                    <span className="hidden sm:inline">Share</span>
                  </button>
                </ActionTooltip>

                <HintAnchor
                  hints={pageHints}
                  hintId={PLAYER_HINT_IDS.editFlow}
                  title="Edit this flow"
                  description="Jump back to the editor to update steps, branching, and screenshots."
                  placement="bottom"
                >
                  <ActionTooltip label="Edit">
                    <Link
                      to={editHref}
                      state={editLinkState}
                      className={FLOW_DOC_PRIMARY_ACTION_CLASS}
                      aria-label="Edit"
                    >
                      <Pencil className="h-4 w-4 shrink-0" aria-hidden />
                      <span className="hidden sm:inline">Edit</span>
                    </Link>
                  </ActionTooltip>
                </HintAnchor>
              </>
            ) : null}
          </>
        }
      />
      {shareModal}
    </>
  );
};
