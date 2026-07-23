import { Link } from 'react-router-dom';
import { Link2, Pencil } from 'lucide-react';
import { DASHBOARD_PATH, LANDING_PATH } from '@/constants/routes';
import {
  FLOW_DOC_ACTION_CLASS,
  FLOW_DOC_PRIMARY_ACTION_CLASS,
  FlowDocChromeHeader,
} from '@/components/flow/FlowDocChromeHeader';
import { useDocumentShareModal } from '@/hooks/useDocumentShareModal';

interface FlowDocHubHeaderProps {
  documentId: string;
  title: string;
  editHref: string;
  editLinkState?: unknown;
  showOwnerActions?: boolean;
}

export const FlowDocHubHeader = ({
  documentId,
  title,
  editHref,
  editLinkState,
  showOwnerActions = true,
}: FlowDocHubHeaderProps) => {
  const { openShare, shareModal } = useDocumentShareModal(documentId);

  return (
    <>
      <FlowDocChromeHeader
        title={title}
        modeBadge={{ label: 'Overview', tone: 'slate' }}
        showBack={showOwnerActions}
        homeTo={showOwnerActions ? DASHBOARD_PATH : LANDING_PATH}
        actions={
          showOwnerActions ? (
            <>
              <button type="button" onClick={openShare} className={FLOW_DOC_ACTION_CLASS}>
                <Link2 className="h-4 w-4 shrink-0" aria-hidden />
                <span className="hidden sm:inline">Share</span>
              </button>

              <Link
                to={editHref}
                state={editLinkState}
                className={FLOW_DOC_PRIMARY_ACTION_CLASS}
              >
                <Pencil className="h-4 w-4 shrink-0" aria-hidden />
                <span className="hidden sm:inline">Edit</span>
              </Link>
            </>
          ) : undefined
        }
      />
      {shareModal}
    </>
  );
};
