import { Link } from 'react-router-dom';
import { useState } from 'react';
import { Copy, Link2, Pencil, Play, Trash2 } from 'lucide-react';
import { ShareDocumentModal } from '@/components/share/ShareDocumentModal';
import { ActionTooltip } from '@/components/ui/ActionTooltip';
import { useCanCreate } from '@/hooks/useOrganization';
import { useCanDeleteLibraryItems } from '@/hooks/useSessionMode';
import { useLibraryNavigationState } from '@/hooks/useLibraryBackState';
import { getFlowDocument, saveFlowDocument } from '@/storage/libraryRouter';
import type { FlowDocumentStatus } from '@/types/savedFlow';
import { getDocumentPath } from '@/utils/shareLink';

interface FlowDocumentActionsProps {
  documentId: string;
  status?: FlowDocumentStatus;
  layout?: 'row' | 'stack';
  onRequestDelete: () => void;
  onRequestDuplicate?: () => void;
}

const ICON_CLASS = 'h-4 w-4 shrink-0';

export const FlowDocumentActions = ({
  documentId,
  status = 'live',
  layout = 'row',
  onRequestDelete,
  onRequestDuplicate,
}: FlowDocumentActionsProps) => {
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const canDelete = useCanDeleteLibraryItems();
  const canCreate = useCanCreate();
  const navigationState = useLibraryNavigationState();
  const canShare = status === 'live';
  const shareLabel = canShare ? 'Share' : 'Publish to Live before sharing';

  const containerClass =
    layout === 'stack'
      ? 'flex justify-center gap-2'
      : 'flex shrink-0 flex-wrap items-center gap-1.5 sm:flex-nowrap';

  const actionClass =
    'inline-flex shrink-0 items-center justify-center rounded-lg border p-2 text-sm font-medium transition-colors sm:px-2.5 sm:py-2';

  return (
    <>
      <div className={containerClass}>
        <ActionTooltip label="Play">
          <Link
            to={getDocumentPath(documentId)}
            state={navigationState}
            className={`${actionClass} border-slate-300 text-slate-700 hover:bg-white`}
            aria-label="Play"
          >
            <Play className={ICON_CLASS} aria-hidden />
          </Link>
        </ActionTooltip>
        <ActionTooltip label="Edit">
          <Link
            to={`/docs/${documentId}/edit`}
            state={navigationState}
            className={`${actionClass} border-peacock-200 bg-peacock-50 text-peacock-800 hover:bg-peacock-100`}
            aria-label="Edit"
          >
            <Pencil className={ICON_CLASS} aria-hidden />
          </Link>
        </ActionTooltip>
        {canCreate && onRequestDuplicate ? (
          <ActionTooltip label="Duplicate">
            <button
              type="button"
              onClick={onRequestDuplicate}
              className={`${actionClass} border-slate-300 text-slate-700 hover:bg-white`}
              aria-label="Duplicate"
            >
              <Copy className={ICON_CLASS} aria-hidden />
            </button>
          </ActionTooltip>
        ) : null}
        <ActionTooltip label={shareLabel} wide={!canShare}>
          <button
            type="button"
            onClick={() => setIsShareModalOpen(true)}
            disabled={!canShare}
            className={`${actionClass} border-slate-300 text-slate-700 hover:bg-white disabled:cursor-not-allowed disabled:opacity-50`}
            aria-label={shareLabel}
          >
            <Link2 className={ICON_CLASS} aria-hidden />
          </button>
        </ActionTooltip>
        {canDelete ? (
          <ActionTooltip label="Delete">
            <button
              type="button"
              onClick={onRequestDelete}
              className={`${actionClass} border-red-200 text-red-700 hover:bg-red-50${
                layout === 'stack' ? ' col-span-2' : ''
              }`}
              aria-label="Delete"
            >
              <Trash2 className={ICON_CLASS} aria-hidden />
            </button>
          </ActionTooltip>
        ) : null}
      </div>

      <ShareDocumentModal
        isOpen={isShareModalOpen}
        documentId={documentId}
        status={status}
        onClose={() => setIsShareModalOpen(false)}
        onShareSettingsSave={(settings) => {
          void (async () => {
            const doc = await getFlowDocument(documentId);
            if (!doc) return;
            await saveFlowDocument({ ...doc, shareSettings: settings, updatedAt: Date.now() });
          })();
        }}
      />
    </>
  );
};
