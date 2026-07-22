import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowUpRight,
  Calendar,
  FileText,
  Layers,
  RefreshCw,
} from 'lucide-react'
import type { SavedFlowSummary } from '@/types/savedFlow'
import { useLibraryNavigationState } from '@/hooks/useLibraryBackState'
import { formatFlowDate } from '@/utils/formatFlowDate'
import {
  formatUpdatedByLine,
  resolveDisplayNameFromEmails,
} from '@/utils/formatUpdatedByLine'
import { FlowDocumentActions } from './FlowDocumentActions'
import { FlowVersionBadge } from './FlowVersionBadge'

interface FlowLibraryCardsProps {
  summaries: SavedFlowSummary[]
  displayNamesByEmail?: Record<string, string>
  onRequestDelete: (summary: SavedFlowSummary) => void
}

export const FlowLibraryCards = ({
  summaries,
  displayNamesByEmail = {},
  onRequestDelete,
}: FlowLibraryCardsProps) => (
  <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
    {summaries.map((summary, index) => (
      <FlowLibraryCard
        key={summary.id}
        summary={summary}
        index={index}
        displayNamesByEmail={displayNamesByEmail}
        onRequestDelete={() => onRequestDelete(summary)}
      />
    ))}
  </div>
)

interface FlowLibraryCardProps {
  summary: SavedFlowSummary
  index: number
  displayNamesByEmail: Record<string, string>
  onRequestDelete: () => void
}

const FlowLibraryCard = ({
  summary,
  index,
  displayNamesByEmail,
  onRequestDelete,
}: FlowLibraryCardProps) => {
  const wasUpdated = summary.updatedAt > summary.generatedAt + 60_000
  const auditName = resolveDisplayNameFromEmails(
    summary.updatedBy,
    summary.createdBy,
    displayNamesByEmail,
  )
  const navigationState = useLibraryNavigationState()

  return (
    <motion.article
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.04 }}
      whileHover={{ y: -4 }}
      className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm ring-1 ring-slate-900/5 transition-shadow hover:border-peacock-200/60 hover:shadow-lg hover:shadow-peacock-100/40"
    >
      <div className="h-1 bg-gradient-to-r from-peacock-500 via-brand-cyan to-brand-violet" />

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="inline-flex rounded-xl bg-gradient-to-br from-peacock-500 to-peacock-700 p-2.5 text-white shadow-md shadow-peacock-500/25">
            <FileText className="h-5 w-5" aria-hidden />
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-peacock-50 px-2.5 py-1 text-xs font-semibold text-peacock-700 ring-1 ring-peacock-100">
            <Layers className="h-3.5 w-3.5" aria-hidden />
            {summary.stepCount} {summary.stepCount === 1 ? 'step' : 'steps'}
          </span>
        </div>

        <Link
          to={`/docs/${summary.id}`}
          state={navigationState}
          className="mt-4 block min-w-0 rounded-lg outline-none ring-peacock-500 focus-visible:ring-2"
        >
          <h3 className="flex items-start gap-1.5 text-lg font-bold leading-snug text-slate-900 transition-colors group-hover:text-peacock-700">
            <span className="min-w-0 truncate">{summary.title}</span>
            <ArrowUpRight
              className="mt-0.5 h-4 w-4 shrink-0 text-slate-400 opacity-0 transition-opacity group-hover:opacity-100"
              aria-hidden
            />
          </h3>
          {summary.description ? (
            <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-600">
              {summary.description}
            </p>
          ) : (
            <p className="mt-2 text-sm italic text-slate-400">
              No description added
            </p>
          )}
        </Link>

        <div className="mt-4">
          <FlowVersionBadge version={summary.version} />
        </div>

        <div className="mt-3 flex flex-col gap-1.5 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1.5">
            <Calendar
              className="h-3.5 w-3.5 shrink-0 text-slate-400"
              aria-hidden
            />
            Generated {formatFlowDate(summary.generatedAt)}
          </span>
          {(wasUpdated || auditName) ? (
            <span className="inline-flex min-w-0 items-center gap-1.5 truncate">
              <RefreshCw
                className="h-3.5 w-3.5 shrink-0 text-slate-400"
                aria-hidden
              />
              {formatUpdatedByLine(
                summary.updatedAt,
                summary.updatedBy,
                formatFlowDate,
                summary.createdBy,
                displayNamesByEmail,
              )}
            </span>
          ) : null}
        </div>
      </div>

      <div className="border-t border-slate-100 bg-slate-50/60 px-5 py-4">
        <FlowDocumentActions
          documentId={summary.id}
          layout="stack"
          onRequestDelete={onRequestDelete}
        />
      </div>
    </motion.article>
  )
}
