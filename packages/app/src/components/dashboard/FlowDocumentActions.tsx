import { Link } from 'react-router-dom';
import { useState } from 'react';
import { Link2, Pencil, Play, Trash2 } from 'lucide-react';
import { ShareDocumentModal } from '@/components/share/ShareDocumentModal';
import { getFlowDocument, saveFlowDocument } from '@/storage/flowLibraryDb';
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

  const containerClass =
    layout === 'stack' ? 'flex justify-center gap-2' : 'flex flex-wrap items-center gap-2';

  const actionClass =
    'inline-flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition-colors';

  return (
    <>
      <div className={containerClass}>
        <Link
          to={getDocumentPath(documentId, 'player')}
          className={`${actionClass} border-slate-300 text-slate-700 hover:bg-white`}
        >
          <Play className={ICON_CLASS} aria-hidden />
        </Link>
        <Link
          to={`/docs/${documentId}/edit`}
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
        <button
          type="button"
          onClick={onRequestDelete}
          className={`${actionClass} border-red-200 text-red-700 hover:bg-red-50${
            layout === 'stack' ? ' col-span-2' : ''
          }`}
        >
          <Trash2 className={ICON_CLASS} aria-hidden />
        </button>
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
