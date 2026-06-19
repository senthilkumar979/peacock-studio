import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import type { SolutionRole } from './solutionsData';

interface SolutionRoleCardProps {
  role: SolutionRole;
  index: number;
}

export const SolutionRoleCard = ({ role, index }: SolutionRoleCardProps) => {
  const Icon = role.icon;

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
    >
      <Link
        to={`/solutions/${role.slug}`}
        className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm shadow-slate-200/50 transition hover:-translate-y-1 hover:border-peacock-200 hover:shadow-lg hover:shadow-peacock-100/60"
      >
        <div className={`bg-gradient-to-br ${role.accentGradient} px-6 py-5`}>
          <div className="flex items-start justify-between gap-3">
            <span
              className={`flex h-11 w-11 items-center justify-center rounded-xl bg-white/20 text-white backdrop-blur-sm`}
            >
              <Icon className="h-5 w-5" aria-hidden />
            </span>
            <ArrowRight
              className="h-5 w-5 shrink-0 text-white/70 transition group-hover:translate-x-0.5 group-hover:text-white"
              aria-hidden
            />
          </div>
          <h3 className="mt-4 text-lg font-bold text-white">{role.shortTitle}</h3>
          <p className="mt-1 text-sm text-white/85">{role.tagline}</p>
        </div>
        <div className="flex flex-1 flex-col p-5">
          <p className="text-sm leading-relaxed text-slate-600">{role.summary}</p>
          <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-peacock-700">
            Explore solution →
          </p>
        </div>
      </Link>
    </motion.article>
  );
};
