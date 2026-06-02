import { GitBranch } from 'lucide-react';
import { sortBranchPaths, type FlowBranch } from '@peacock/shared';

interface DocumentBranchCardProps {
  branch: FlowBranch;
  anchorId: string;
  isActive: boolean;
}

export const DocumentBranchCard = ({
  branch,
  anchorId,
  isActive,
}: DocumentBranchCardProps) => {
  const paths = sortBranchPaths(branch.paths);

  return (
    <article
      id={anchorId}
      className={`scroll-mt-24 rounded-2xl border bg-white p-6 shadow-sm transition ${
        isActive ? 'border-brand-violet ring-2 ring-brand-violet/20' : 'border-slate-200'
      }`}
    >
      <div className="flex items-center gap-2 text-brand-violet">
        <GitBranch className="h-4 w-4" aria-hidden />
        <p className="text-xs font-semibold uppercase tracking-wide">Branch</p>
      </div>
      <h3 className="mt-2 text-xl font-bold text-slate-900">{branch.title}</h3>
      {branch.description ? (
        <p className="mt-2 text-sm text-slate-600">{branch.description}</p>
      ) : null}
      {paths.length > 0 ? (
        <ul className="mt-4 flex flex-wrap gap-2">
          {paths.map((path) => (
            <li
              key={path.id}
              className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700"
            >
              {path.label}
            </li>
          ))}
        </ul>
      ) : null}
    </article>
  );
};
