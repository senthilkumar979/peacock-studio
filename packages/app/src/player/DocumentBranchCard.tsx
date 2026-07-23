import { GitBranch } from 'lucide-react';
import { sortBranchPaths, type FlowBranch, type LinkedPeacockPath } from '@peacock/shared';
import { getBranchAccentColors } from './documentAccentColors';
import { FlowBranchPathOption } from './FlowBranchPathOption';
import { useBranchPathMetadata } from './useBranchPathMetadata';

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
  const accent = getBranchAccentColors(branch.id);

  return (
    <article
      id={anchorId}
      className={`relative scroll-mt-24 overflow-hidden rounded-2xl border border-l-4 shadow-sm transition ${
        isActive
          ? `${accent.borderCardActive} ${accent.borderLeft} ring-2 ${accent.ringActive}`
          : `border-slate-200/80 ${accent.borderLeft}`
      }`}
    >
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute inset-0 bg-gradient-to-br from-peacock-50/70 via-white/90 to-white" />
        <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-peacock-200/20 blur-3xl" />
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-peacock-300/50 to-transparent"
      />

      <div className="relative bg-white/55 p-6 backdrop-blur-sm supports-[backdrop-filter]:bg-white/40">
        <div className={`flex items-center gap-2 ${accent.icon}`}>
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
            <ul className="mt-3 flex flex-col gap-2">
              {paths.map((path, index) => (
                <FlowBranchPathOption
                  key={path.id}
                  path={path}
                  index={index}
                  meta={metaByPathId[path.id]}
                  isSelected={path.id === selectedPathId}
                  layout="column"
                  onSelect={() => onSelectPath(path)}
                />
              ))}
            </ul>
          </div>
        ) : (
          <p className="mt-4 text-sm text-slate-500">No paths are configured for this branch yet.</p>
        )}
      </div>
    </article>
  );
};
