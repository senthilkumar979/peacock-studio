import { Link } from 'react-router-dom';
import { LayoutGrid, Link2, Pencil } from 'lucide-react';
import { DASHBOARD_PATH, LANDING_PATH } from '@/constants/routes';
import {
  FLOW_DOC_ACTION_CLASS,
  FLOW_DOC_PRIMARY_ACTION_CLASS,
  FlowDocChromeHeader,
} from '@/components/flow/FlowDocChromeHeader';
import { HintAnchor, type PageHintControl } from '@/components/onboarding/HintAnchor';
import { PLAYER_HINT_IDS } from '@/constants/firstTimeHints';
import { useDocumentShareModal } from '@/hooks/useDocumentShareModal';
import { SharedViewToggle } from '@/player/SharedViewToggle';
import type { SharedDocumentViewMode } from '@/utils/shareLink';

interface FlowDocViewHeaderProps {
  documentId: string;
  title: string;
  viewMode: SharedDocumentViewMode;
  onViewModeChange: (mode: SharedDocumentViewMode) => void;
  onOverview?: () => void;
  editHref: string;
  editLinkState?: unknown;
  pageHints?: PageHintControl;
  showOwnerActions?: boolean;
  guideProgressPercent?: number;
  isEmbed?: boolean;
}

export const FlowDocViewHeader = ({
  documentId,
  title,
  viewMode,
  onViewModeChange,
  onOverview,
  editHref,
  editLinkState,
  pageHints,
  showOwnerActions = true,
  guideProgressPercent,
  isEmbed = false,
}: FlowDocViewHeaderProps) => {
  const { openShare, shareModal } = useDocumentShareModal(documentId);
  const modeLabel = viewMode === 'player' ? 'Player' : 'Guide';
  const showChromeNav = showOwnerActions && !isEmbed;

  return (
    <>
      <FlowDocChromeHeader
        title={title}
        modeBadge={!isEmbed ? { label: modeLabel, tone: 'peacock' } : undefined}
        showBack={showChromeNav}
        homeTo={showChromeNav ? DASHBOARD_PATH : LANDING_PATH}
        stickyHeaderMarker
        guideProgressPercent={guideProgressPercent}
        actions={
          <>
            {onOverview && !isEmbed ? (
              <button type="button" onClick={onOverview} className={FLOW_DOC_ACTION_CLASS}>
                <LayoutGrid className="h-4 w-4 shrink-0" aria-hidden />
                <span className="hidden sm:inline">Overview</span>
              </button>
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
                <button type="button" onClick={openShare} className={FLOW_DOC_ACTION_CLASS}>
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
                    className={FLOW_DOC_PRIMARY_ACTION_CLASS}
                  >
                    <Pencil className="h-4 w-4 shrink-0" aria-hidden />
                    <span className="hidden sm:inline">Edit</span>
                  </Link>
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
