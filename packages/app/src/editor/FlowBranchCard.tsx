import { GitBranch } from 'lucide-react';
import { getBranchPresentation, sortBranchPaths, type FlowBranch } from '@peacock/shared';

interface FlowBranchCardProps {
  branch: FlowBranch;
}

export const FlowBranchCard = ({ branch }: FlowBranchCardProps) => {
  const paths = sortBranchPaths(branch.paths);
  const presentation = getBranchPresentation(branch);

  return (
    <div className="mx-auto w-full max-w-2xl rounded-2xl border border-brand-violet/25 bg-white p-8 shadow-sm">
      <div className="flex items-center gap-2 text-brand-violet">
        <GitBranch className="h-5 w-5" aria-hidden />
        <p className="text-xs font-semibold uppercase tracking-wide">Branch point</p>
      </div>
      <h2 className="mt-3 text-2xl font-bold text-slate-900">{branch.title}</h2>
      {branch.description ? (
        <p className="mt-2 text-sm text-slate-600">{branch.description}</p>
      ) : null}

      {paths.length === 0 ? (
        <p className="mt-6 rounded-lg border border-dashed border-slate-300 p-4 text-sm text-slate-500">
          No paths linked yet. Use &quot;Create a branching point&quot; or &quot;Add path&quot; in the panel.
        </p>
      ) : (
        <ul
          className={`mt-6 gap-2 ${
            presentation === 'grid' ? 'grid sm:grid-cols-2' : 'flex flex-col'
          }`}
        >
          {paths.map((path) => (
            <li
              key={path.id}
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-800"
            >
              {path.label}
              <p className="mt-1 text-xs font-normal text-slate-500">{path.targetTitle}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
