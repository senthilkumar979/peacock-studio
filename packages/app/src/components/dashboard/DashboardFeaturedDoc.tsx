import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Layers, Pencil, Play, Sparkles } from 'lucide-react';
import type { SavedFlowSummary } from '@/types/savedFlow';
import { useLibraryNavigationState } from '@/hooks/useLibraryBackState';
import { formatFlowDate } from '@/utils/formatFlowDate';
import { getDocumentPath } from '@/utils/shareLink';

interface DashboardFeaturedDocProps {
  summary: SavedFlowSummary;
}

export const DashboardFeaturedDoc = ({ summary }: DashboardFeaturedDocProps) => {
  const navigationState = useLibraryNavigationState();

  return (
  <motion.section
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay: 0.25 }}
    className="relative overflow-hidden rounded-2xl border border-peacock-200/60 bg-gradient-to-r from-peacock-50 via-white to-brand-violet/5 p-6 shadow-sm"
  >
    <motion.div
      aria-hidden
      className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-peacock-200/30 blur-2xl"
    />
    <motion.div
      aria-hidden
      className="pointer-events-none absolute bottom-0 left-1/3 h-24 w-24 rounded-full bg-brand-violet/10 blur-2xl"
    />

    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3 }}
      className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between"
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35 }}
        className="min-w-0 flex-1"
      >
        <p className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-peacock-600">
          <Sparkles className="h-3.5 w-3.5" aria-hidden />
          Latest documentation
        </p>
        <h2 className="mt-2 truncate text-xl font-bold text-slate-900">{summary.title}</h2>
        {summary.description ? (
          <p className="mt-2 line-clamp-2 max-w-2xl text-sm leading-relaxed text-slate-600">
            {summary.description}
          </p>
        ) : (
          <p className="mt-2 text-sm italic text-slate-400">No description added yet</p>
        )}
        <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 font-medium ring-1 ring-slate-200">
            <Layers className="h-3.5 w-3.5 text-peacock-600" aria-hidden />
            {summary.stepCount} {summary.stepCount === 1 ? 'step' : 'steps'}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-slate-400" aria-hidden />
            Generated {formatFlowDate(summary.generatedAt)}
          </span>
        </div>
      </motion.div>

      <div className="flex shrink-0 flex-wrap gap-2">
        <Link
          to={getDocumentPath(summary.id, 'player')}
          state={navigationState}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
        >
          <Play className="h-4 w-4" aria-hidden />
          Open player
        </Link>
        <Link
          to={`/docs/${summary.id}/edit`}
          state={navigationState}
          className="inline-flex items-center gap-2 rounded-xl bg-peacock-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-peacock-600/25 transition hover:bg-peacock-700"
        >
          <Pencil className="h-4 w-4" aria-hidden />
          Continue editing
        </Link>
      </div>
    </motion.div>
  </motion.section>
  );
};
