import { Link } from 'react-router-dom';
import { useState } from 'react';
import { Link2, Pencil, Play, Trash2 } from 'lucide-react';
import { ShareDocumentModal } from '@/components/share/ShareDocumentModal';
import { useCanDeleteLibraryItems } from '@/hooks/useSessionMode';
import { useLibraryNavigationState } from '@/hooks/useLibraryBackState';
import { getFlowDocument, saveFlowDocument } from '@/storage/libraryRouter';
import { getDocumentPath } from '@/utils/shareLink';

interface FlowDocumentActionsProps {
  documentId: string;
  layout?: 'row' | 'stack';
  onRequestDelete: () => void;
}

const ICON_CLASS = 'h-4 w-4 shrink-0';

export const FlowDocumentActions = ({
  documentId,
  layout = 'row',
  onRequestDelete,
}: FlowDocumentActionsProps) => {
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const canDelete = useCanDeleteLibraryItems();
  const navigationState = useLibraryNavigationState();

  const containerClass =
    layout === 'stack'
      ? 'flex justify-center gap-2'
      : 'flex shrink-0 flex-wrap items-center gap-1.5 sm:flex-nowrap';

  const actionClass =
    'inline-flex shrink-0 items-center justify-center rounded-lg border p-2 text-sm font-medium transition-colors sm:px-2.5 sm:py-2';

  return (
    <>
      <div className={containerClass}>
        <Link
          to={getDocumentPath(documentId, 'player')}
          state={navigationState}
          className={`${actionClass} border-slate-300 text-slate-700 hover:bg-white`}
        >
          <Play className={ICON_CLASS} aria-hidden />
        </Link>
        <Link
          to={`/docs/${documentId}/edit`}
          state={navigationState}
          className={`${actionClass} border-peacock-200 bg-peacock-50 text-peacock-800 hover:bg-peacock-100`}
        >
          <Pencil className={ICON_CLASS} aria-hidden />
        </Link>
        <button
          type="button"
          onClick={() => setIsShareModalOpen(true)}
          className={`${actionClass} border-slate-300 text-slate-700 hover:bg-white`}
        >
          <Link2 className={ICON_CLASS} aria-hidden />
        </button>
        {canDelete ? (
        <button
          type="button"
          onClick={onRequestDelete}
          className={`${actionClass} border-red-200 text-red-700 hover:bg-red-50${
            layout === 'stack' ? ' col-span-2' : ''
          }`}
        >
          <Trash2 className={ICON_CLASS} aria-hidden />
        </button>
        ) : null}
      </div>

      <ShareDocumentModal
        isOpen={isShareModalOpen}
        documentId={documentId}
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
