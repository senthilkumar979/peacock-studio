import { Link } from 'react-router-dom';
import { useState } from 'react';
import { exportFlowPdf } from '@/pdf/exportFlowPdf';
import { getFlowDocument } from '@/services/flowLibraryService';
import { copyDocumentShareLink } from '@/utils/shareLink';

interface FlowDocumentActionsProps {
  documentId: string;
  layout?: 'row' | 'stack';
  onRequestDelete: () => void;
}

export const FlowDocumentActions = ({
  documentId,
  layout = 'row',
  onRequestDelete,
}: FlowDocumentActionsProps) => {
  const [isExporting, setIsExporting] = useState(false);
  const [shareMessage, setShareMessage] = useState<string | null>(null);

  const containerClass = layout === 'stack' ? 'flex flex-col gap-2' : 'flex flex-wrap items-center gap-2';

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const doc = await getFlowDocument(documentId);
      if (!doc) return;
      await exportFlowPdf({
        flow: doc.flow,
        steps: doc.steps,
        screenshotUrls: doc.screenshotUrls,
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleShare = async () => {
    try {
      await copyDocumentShareLink(documentId);
      setShareMessage('Link copied');
      window.setTimeout(() => setShareMessage(null), 2000);
    } catch {
      setShareMessage('Copy failed');
    }
  };

  return (
    <div className={containerClass}>
      <Link
        to={`/docs/${documentId}`}
        className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
      >
        Open
      </Link>
      <Link
        to={`/docs/${documentId}/edit`}
        className="rounded-lg border border-peacock-200 bg-peacock-50 px-3 py-1.5 text-sm font-medium text-peacock-800 hover:bg-peacock-100"
      >
        Edit
      </Link>
      <button
        type="button"
        onClick={() => void handleExport()}
        disabled={isExporting}
        className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
      >
        {isExporting ? 'Exporting…' : 'Export PDF'}
      </button>
      <button
        type="button"
        onClick={() => void handleShare()}
        className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
      >
        {shareMessage ?? 'Share link'}
      </button>
      <button
        type="button"
        onClick={onRequestDelete}
        className="rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50"
      >
        Delete
      </button>
    </div>
  );
};
