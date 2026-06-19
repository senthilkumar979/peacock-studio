import { GitBranch } from 'lucide-react';
import { sortBranchPaths, type FlowBranch, type LinkedPeacockPath } from '@peacock/shared';
import { FlowBranchPathOption } from './FlowBranchPathOption';
import { useBranchPathMetadata } from './useBranchPathMetadata';

function getDocumentBranchPathLayout(pathCount: number): 'column' | 'row' {
  if (pathCount === 1 || pathCount >= 4) return 'column';
  return 'row';
}

interface DocumentBranchCardProps {
  branch: FlowBranch;
  anchorId: string;
  isActive: boolean;
  selectedPathId: string | null;
  onSelectPath: (path: LinkedPeacockPath) => void;
}

export const DocumentBranchCard = ({
  branch,
  anchorId,
  isActive,
  selectedPathId,
  onSelectPath,
}: DocumentBranchCardProps) => {
  const paths = sortBranchPaths(branch.paths);
  const metaByPathId = useBranchPathMetadata(branch);
  const layout = getDocumentBranchPathLayout(paths.length);

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
        <div className="mt-5">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            {paths.length === 1 ? 'Automatically chosen path' : 'Select a path'}
          </p>
          <ul
            className={`mt-3 ${
              layout === 'row'
                ? 'flex flex-row items-start gap-3 overflow-x-auto pb-1'
                : 'flex flex-col gap-2'
            }`}
          >
            {paths.map((path, index) => (
              <FlowBranchPathOption
                key={path.id}
                path={path}
                index={index}
                meta={metaByPathId[path.id]}
                isSelected={path.id === selectedPathId}
                layout={layout}
                onSelect={() => onSelectPath(path)}
              />
            ))}
          </ul>
        </div>
      ) : (
        <p className="mt-4 text-sm text-slate-500">No paths are configured for this branch yet.</p>
      )}
    </article>
  );
};
