import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowUpRight, BookOpen, Calendar, Layers, Route as RouteIcon } from 'lucide-react';
import type { SavedRouteSummary } from '@/types/route';
import { formatFlowDate } from '@/utils/formatFlowDate';
import { RouteDocumentActions } from './RouteDocumentActions';

interface RouteLibraryCardsProps {
  summaries: SavedRouteSummary[];
  onRequestDelete: (summary: SavedRouteSummary) => void;
}

export const RouteLibraryCards = ({ summaries, onRequestDelete }: RouteLibraryCardsProps) => (
  <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
    {summaries.map((summary, index) => (
      <RouteLibraryCard
        key={summary.id}
        summary={summary}
        index={index}
        onRequestDelete={() => onRequestDelete(summary)}
      />
    ))}
  </div>
);

interface RouteLibraryCardProps {
  summary: SavedRouteSummary;
  index: number;
  onRequestDelete: () => void;
}

const RouteLibraryCard = ({ summary, index, onRequestDelete }: RouteLibraryCardProps) => (
  <motion.article
    initial={{ opacity: 0, y: 14 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.35, delay: index * 0.04 }}
    whileHover={{ y: -4 }}
    className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm ring-1 ring-slate-900/5 transition-shadow hover:border-brand-violet/30 hover:shadow-lg hover:shadow-brand-violet/10"
  >
    <div className="h-1 bg-gradient-to-r from-brand-violet via-peacock-500 to-brand-cyan" />

    <div className="flex flex-1 flex-col p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="inline-flex rounded-xl bg-gradient-to-br from-brand-violet to-peacock-700 p-2.5 text-white shadow-md shadow-brand-violet/25">
          <RouteIcon className="h-5 w-5" aria-hidden />
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${
              summary.status === 'live'
                ? 'bg-emerald-50 text-emerald-700 ring-emerald-100'
                : 'bg-slate-100 text-slate-600 ring-slate-200'
            }`}
          >
            {summary.status === 'live' ? 'Live' : 'Draft'}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-peacock-50 px-2.5 py-1 text-xs font-semibold text-peacock-700 ring-1 ring-peacock-100">
            <BookOpen className="h-3.5 w-3.5" aria-hidden />
            {summary.chapterCount} {summary.chapterCount === 1 ? 'chapter' : 'chapters'}
          </span>
        </div>
      </div>

      <Link
        to={`/routes/${summary.id}`}
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
          <p className="mt-2 text-sm italic text-slate-400">No description added</p>
        )}
      </Link>

      <div className="mt-4 flex flex-col gap-1.5 text-xs text-slate-500">
        <span className="inline-flex items-center gap-1.5">
          <Layers className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden />
          {summary.peacockCount} {summary.peacockCount === 1 ? 'demo' : 'demos'}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden />
          Updated {formatFlowDate(summary.updatedAt)}
        </span>
      </div>
    </div>

    <div className="border-t border-slate-100 bg-slate-50/60 px-5 py-4">
      <RouteDocumentActions routeId={summary.id} onRequestDelete={onRequestDelete} />
    </div>
  </motion.article>
);
