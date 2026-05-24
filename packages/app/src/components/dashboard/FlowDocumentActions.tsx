import { Link } from 'react-router-dom'
import { useState } from 'react'
import { FileDown, Link2, Loader2, Pencil, Play, Trash2 } from 'lucide-react'
import { exportFlowPdf } from '@/pdf/exportFlowPdf'
import { getFlowDocument } from '@/services/flowLibraryService'
import { copyDocumentShareLink } from '@/utils/shareLink'

interface FlowDocumentActionsProps {
  documentId: string
  layout?: 'row' | 'stack'
  onRequestDelete: () => void
}

const ICON_CLASS = 'h-4 w-4 shrink-0'

export const FlowDocumentActions = ({
  documentId,
  layout = 'row',
  onRequestDelete,
}: FlowDocumentActionsProps) => {
  const [isExporting, setIsExporting] = useState(false)
  const [shareMessage, setShareMessage] = useState<string | null>(null)

  const containerClass =
    layout === 'stack'
      ? 'flex justify-center gap-2'
      : 'flex flex-wrap items-center gap-2'

  const handleExport = async () => {
    setIsExporting(true)
    try {
      const doc = await getFlowDocument(documentId)
      if (!doc) return
      await exportFlowPdf({
        flow: doc.flow,
        steps: doc.steps,
        screenshotUrls: doc.screenshotUrls,
      })
    } finally {
      setIsExporting(false)
    }
  }

  const handleShare = async () => {
    try {
      await copyDocumentShareLink(documentId)
      setShareMessage('Link copied')
      window.setTimeout(() => setShareMessage(null), 2000)
    } catch {
      setShareMessage('Copy failed')
    }
  }

  const actionClass =
    'inline-flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition-colors'

  return (
    <div className={containerClass}>
      <Link
        to={`/docs/${documentId}`}
        className={`${actionClass} border-slate-300 text-slate-700 hover:bg-white`}
      >
        <Play className={ICON_CLASS} aria-hidden />
        {/* Open */}
      </Link>
      <Link
        to={`/docs/${documentId}/edit`}
        className={`${actionClass} border-peacock-200 bg-peacock-50 text-peacock-800 hover:bg-peacock-100`}
      >
        <Pencil className={ICON_CLASS} aria-hidden />
        {/* Edit */}
      </Link>
      <button
        type="button"
        onClick={() => void handleExport()}
        disabled={isExporting}
        className={`${actionClass} border-slate-300 text-slate-700 hover:bg-white disabled:opacity-60`}
      >
        {isExporting ? (
          <Loader2 className={`${ICON_CLASS} animate-spin`} aria-hidden />
        ) : (
          <FileDown className={ICON_CLASS} aria-hidden />
        )}
        {/* {isExporting ? 'Exporting…' : 'Export PDF'} */}
      </button>
      <button
        type="button"
        onClick={() => void handleShare()}
        className={`${actionClass} border-slate-300 text-slate-700 hover:bg-white`}
      >
        <Link2 className={ICON_CLASS} aria-hidden />
        {/* {shareMessage ?? 'Share link'} */}
      </button>
      <button
        type="button"
        onClick={onRequestDelete}
        className={`${actionClass} border-red-200 text-red-700 hover:bg-red-50${
          layout === 'stack' ? ' col-span-2' : ''
        }`}
      >
        <Trash2 className={ICON_CLASS} aria-hidden />
        {/* Delete */}
      </button>
    </div>
  )
}
