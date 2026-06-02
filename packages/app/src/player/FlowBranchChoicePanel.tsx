import { useEffect, useState } from 'react';
import { ArrowRight, GitBranch, Sparkles } from 'lucide-react';
import { sortBranchPaths, type FlowBranch, type LinkedPeacockPath } from '@peacock/shared';
import { FlowBranchPathOption } from './FlowBranchPathOption';
import { useBranchPathMetadata } from './useBranchPathMetadata';

interface FlowBranchChoicePanelProps {
  branch: FlowBranch;
  onSelect: (path: LinkedPeacockPath) => void;
}

export const FlowBranchChoicePanel = ({ branch, onSelect }: FlowBranchChoicePanelProps) => {
  const paths = sortBranchPaths(branch.paths);
  const metaByPathId = useBranchPathMetadata(branch);
  const [selectedPathId, setSelectedPathId] = useState<string | null>(paths[0]?.id ?? null);
  const selectedPath = paths.find((path) => path.id === selectedPathId) ?? null;
  const useRowLayout = paths.length < 4;

  useEffect(() => {
    setSelectedPathId(paths[0]?.id ?? null);
  }, [branch.id]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Enter' && selectedPath) {
        event.preventDefault();
        onSelect(selectedPath);
        return;
      }

      const index = Number.parseInt(event.key, 10);
      if (index >= 1 && index <= paths.length) {
        event.preventDefault();
        setSelectedPathId(paths[index - 1]?.id ?? null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onSelect, paths, selectedPath]);

  if (!paths.length) {
    return (
      <div className="mx-auto w-full max-w-2xl rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
        <p className="text-sm text-slate-500">No paths are configured for this branch yet.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-2 sm:px-0">
      <article className="relative rounded-3xl border border-slate-200/80 bg-white shadow-xl shadow-slate-200/50">
        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl" aria-hidden>
          <div className="absolute inset-0 bg-gradient-to-br from-peacock-50/90 via-white to-brand-violet/5" />
          <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-peacock-200/25 blur-3xl" />
        </div>
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-peacock-500 via-peacock-600 to-brand-violet" />

        <div className="relative px-5 py-6 sm:px-8 sm:py-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-peacock-600 to-brand-violet text-white shadow-lg shadow-peacock-600/25">
              <GitBranch className="h-7 w-7" aria-hidden />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-violet/20 bg-brand-violet/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-brand-violet">
                  <Sparkles className="h-3.5 w-3.5" aria-hidden />
                  Branch point
                </span>
                <span className="rounded-full bg-slate-900/5 px-2.5 py-0.5 text-xs font-medium text-slate-500">
                  {paths.length} {paths.length === 1 ? 'path' : 'paths'}
                </span>
              </div>

              <h2 className="mt-4 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                {branch.title}
              </h2>

              {branch.description ? (
                <p className="mt-3 text-base leading-relaxed text-slate-600 sm:text-lg">
                  {branch.description}
                </p>
              ) : null}
            </div>
          </div>

          <div className="mt-6 sm:mt-8">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Select a path
            </p>

            <ul
              className={`mt-3 sm:mt-4 ${
                useRowLayout
                  ? 'flex flex-row items-start gap-3 overflow-x-auto pb-1 sm:gap-4 sm:pb-2'
                  : 'flex flex-col gap-2 sm:gap-2.5'
              }`}
            >
              {paths.map((path, index) => (
                <FlowBranchPathOption
                  key={path.id}
                  path={path}
                  index={index}
                  meta={metaByPathId[path.id]}
                  isSelected={path.id === selectedPathId}
                  layout={useRowLayout ? 'row' : 'column'}
                  onSelect={() => setSelectedPathId(path.id)}
                />
              ))}
            </ul>
          </div>

          <div className="mt-6 flex flex-col items-stretch gap-3 border-t border-slate-200/80 pt-5 sm:mt-8 sm:gap-4 sm:pt-6 lg:flex-row lg:items-center lg:justify-between">
            <p className="text-center text-sm text-slate-500 sm:text-left">
              Press{' '}
              <kbd className="rounded-md border border-slate-200 bg-white px-1.5 py-0.5 font-mono text-xs text-slate-700">
                1–{paths.length}
              </kbd>{' '}
              to select, then{' '}
              <kbd className="rounded-md border border-slate-200 bg-white px-1.5 py-0.5 font-mono text-xs text-slate-700">
                Enter
              </kbd>{' '}
              to continue.
            </p>

            <button
              type="button"
              disabled={!selectedPath}
              onClick={() => selectedPath && onSelect(selectedPath)}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-peacock-600 to-brand-violet px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-peacock-600/25 transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {selectedPath ? `Start: ${selectedPath.label}` : 'Choose a path'}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </button>
          </div>
        </div>
      </article>
    </div>
  );
};
