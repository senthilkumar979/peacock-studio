import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { WhenPeacockFitsBest } from './platformComparisonData';

interface WhenPeacockFitsBestPanelProps {
  content: WhenPeacockFitsBest;
}

export const WhenPeacockFitsBestPanel = ({ content }: WhenPeacockFitsBestPanelProps) => (
  <motion.aside
    initial={{ opacity: 0, y: 16 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.35 }}
    transition={{ duration: 0.4 }}
    className="mt-10 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
  >
    <div className="border-l-4 border-peacock-600 px-6 py-8 sm:px-8">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-peacock-700">
        {content.title}
      </p>
      <p className="mt-4 max-w-3xl text-xl font-semibold leading-snug text-slate-900 sm:text-2xl">
        {content.thesis}
      </p>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600">{content.complement}</p>
    </div>

    <div className="grid gap-px border-t border-slate-200 bg-slate-200 sm:grid-cols-3">
      {content.signals.map((signal, index) => (
        <motion.div
          key={signal.title}
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: index * 0.06 }}
          className="bg-white px-5 py-5 sm:px-6"
        >
          <p className="text-sm font-semibold text-slate-900">{signal.title}</p>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">{signal.copy}</p>
        </motion.div>
      ))}
    </div>

    <div className="border-t border-slate-200 px-6 py-4 sm:px-8">
      <Link
        to="/solutions"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-peacock-700 transition hover:text-peacock-900"
      >
        Explore solutions by role
        <ArrowRight className="h-4 w-4" aria-hidden />
      </Link>
    </div>
  </motion.aside>
);
