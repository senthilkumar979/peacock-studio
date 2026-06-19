import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { SOLUTION_ROLES, type SolutionRole } from './solutionsData';

interface SolutionRoleExploreMoreProps {
  role: SolutionRole;
}

export const SolutionRoleExploreMore = ({ role }: SolutionRoleExploreMoreProps) => {
  const currentIndex = SOLUTION_ROLES.findIndex((item) => item.slug === role.slug);
  const prevRole = currentIndex > 0 ? SOLUTION_ROLES[currentIndex - 1] : null;
  const nextRole =
    currentIndex >= 0 && currentIndex < SOLUTION_ROLES.length - 1
      ? SOLUTION_ROLES[currentIndex + 1]
      : null;

  return (
    <section className="border-t border-slate-200 bg-white px-6 py-16">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-peacock-700">
              Explore more
            </p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900">Other role solutions</h2>
          </div>
          <Link
            to="/solutions"
            className="text-sm font-semibold text-peacock-700 hover:text-peacock-900"
          >
            View all roles →
          </Link>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {prevRole ? (
            <Link
              to={`/solutions/${prevRole.slug}`}
              className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-5 transition hover:border-peacock-200 hover:bg-white hover:shadow-md"
            >
              <ArrowLeft
                className="h-5 w-5 shrink-0 text-slate-400 transition group-hover:text-peacock-700"
                aria-hidden
              />
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Previous</p>
                <p className="mt-1 font-semibold text-slate-900">{prevRole.shortTitle}</p>
              </div>
            </Link>
          ) : (
            <div aria-hidden />
          )}

          {nextRole ? (
            <Link
              to={`/solutions/${nextRole.slug}`}
              className="group flex items-center justify-end gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-5 text-right transition hover:border-peacock-200 hover:bg-white hover:shadow-md sm:col-start-2"
            >
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Next</p>
                <p className="mt-1 font-semibold text-slate-900">{nextRole.shortTitle}</p>
              </div>
              <ArrowRight
                className="h-5 w-5 shrink-0 text-slate-400 transition group-hover:text-peacock-700"
                aria-hidden
              />
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  );
};
