import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { SavedFlowSummary } from '@/types/savedFlow';
import { formatFlowDate } from '@/utils/formatFlowDate';

interface DashboardFeaturedDocProps {
  summary: SavedFlowSummary;
}

export const DashboardFeaturedDoc = ({ summary }: DashboardFeaturedDocProps) => (
  <motion.section
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay: 0.25 }}
    className="relative overflow-hidden rounded-2xl border border-peacock-200/60 bg-gradient-to-r from-peacock-50 via-white to-brand-violet/5 p-6 shadow-sm"
  >
    <div
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
        <p className="text-xs font-semibold uppercase tracking-wide text-peacock-600">
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
            {summary.stepCount} {summary.stepCount === 1 ? 'step' : 'steps'}
          </span>
          <span>Generated {formatFlowDate(summary.generatedAt)}</span>
        </div>
      </motion.div>

      <div className="flex shrink-0 flex-wrap gap-2">
        <Link
          to={`/docs/${summary.id}`}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
        >
          Open player
        </Link>
        <Link
          to={`/docs/${summary.id}/edit`}
          className="rounded-xl bg-peacock-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-peacock-600/25 transition hover:bg-peacock-700"
        >
          Continue editing
        </Link>
      </div>
    </motion.div>
  </motion.section>
);
