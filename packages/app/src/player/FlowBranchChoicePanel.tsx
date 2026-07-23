import { useEffect } from "react";
import { ArrowRight, GitBranch, Sparkles } from "lucide-react";
import {
  sortBranchPaths,
  type FlowBranch,
  type LinkedPeacockPath,
} from "@peacock/shared";
import { FlowBranchPathOption } from "./FlowBranchPathOption";
import { useBranchPathMetadata } from "./useBranchPathMetadata";

interface FlowBranchChoicePanelProps {
  branch: FlowBranch;
  selectedPathId: string | null;
  onSelectedPathChange: (pathId: string) => void;
  onSelect: (path: LinkedPeacockPath) => void;
}

export const FlowBranchChoicePanel = ({
  branch,
  selectedPathId,
  onSelectedPathChange,
  onSelect,
}: FlowBranchChoicePanelProps) => {
  const paths = sortBranchPaths(branch.paths);
  const metaByPathId = useBranchPathMetadata(branch);
  const selectedPath = paths.find((path) => path.id === selectedPathId) ?? null;

  useEffect(() => {
    const firstPathId = paths[0]?.id ?? null;
    if (firstPathId && !selectedPathId) {
      onSelectedPathChange(firstPathId);
    }
  }, [branch.id, onSelectedPathChange, paths, selectedPathId]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Enter" && selectedPath) {
        event.preventDefault();
        onSelect(selectedPath);
        return;
      }

      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        if (paths.length <= 1) return;

        event.preventDefault();
        const currentIndex = Math.max(
          0,
          paths.findIndex((path) => path.id === selectedPathId),
        );
        const offset = event.key === "ArrowDown" ? 1 : -1;
        const nextIndex = (currentIndex + offset + paths.length) % paths.length;
        const nextPath = paths[nextIndex];
        if (nextPath) onSelectedPathChange(nextPath.id);
        return;
      }

      const index = Number.parseInt(event.key, 10);
      if (index >= 1 && index <= paths.length) {
        event.preventDefault();
        const path = paths[index - 1];
        if (path) onSelectedPathChange(path.id);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onSelect, onSelectedPathChange, paths, selectedPath, selectedPathId]);

  if (!paths.length) {
    return (
      <div className="mx-auto w-full max-w-2xl rounded-3xl border border-dashed border-slate-300/80 bg-white/80 p-10 text-center shadow-sm backdrop-blur-sm">
        <p className="text-sm text-slate-500">
          No paths are configured for this branch yet.
        </p>
      </div>
    );
  }

  return (
    <div className="relative mx-auto w-full max-w-4xl px-2 sm:px-0">
      <div
        className="pointer-events-none absolute inset-x-0 -top-10 bottom-0 -z-10 overflow-hidden"
        aria-hidden
      >
        <div className="absolute inset-0 bg-gradient-to-b from-peacock-50/70 via-slate-50/40 to-transparent" />
        <div className="absolute left-1/2 top-0 h-72 w-[min(100%,42rem)] -translate-x-1/2 rounded-full bg-peacock-200/25 blur-3xl" />
        <div className="absolute -left-10 top-24 h-48 w-48 rounded-full bg-brand-cyan/10 blur-3xl" />
      </div>

      <article className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white/80 shadow-xl shadow-slate-200/40 backdrop-blur-xl supports-[backdrop-filter]:bg-white/70">
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <div className="absolute inset-0 bg-gradient-to-br from-peacock-50/80 via-white/50 to-brand-cyan/[0.04]" />
          <div className="absolute -right-20 -top-24 h-56 w-56 rounded-full bg-peacock-200/30 blur-3xl" />
          <div className="absolute -bottom-28 left-1/4 h-48 w-48 rounded-full bg-brand-cyan/10 blur-3xl" />
        </div>

        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-peacock-300/70 to-transparent"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-peacock-500 via-peacock-600 to-brand-cyan/80 opacity-90"
        />

        <div className="relative px-5 py-6 sm:px-8 sm:py-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-peacock-500 to-peacock-700 text-white shadow-md shadow-peacock-500/25 ring-1 ring-peacock-600/10">
              <GitBranch className="h-7 w-7" aria-hidden />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-peacock-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-peacock-700 ring-1 ring-peacock-100">
                  <Sparkles className="h-3.5 w-3.5" aria-hidden />
                  Branch point
                </span>
                <span className="rounded-full bg-slate-100/90 px-2.5 py-0.5 text-xs font-medium text-slate-600 ring-1 ring-slate-200/80">
                  {paths.length} {paths.length === 1 ? "path" : "paths"}
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

            <ul className="mt-3 flex flex-col gap-2 sm:mt-4 sm:gap-2.5">
              {paths.map((path, index) => (
                <FlowBranchPathOption
                  key={path.id}
                  path={path}
                  index={index}
                  meta={metaByPathId[path.id]}
                  isSelected={path.id === selectedPathId}
                  layout="column"
                  onSelect={() => onSelectedPathChange(path.id)}
                />
              ))}
            </ul>
          </div>

          <p className="text-center text-sm text-slate-500 sm:text-left mt-5">
            Use{" "}
            <kbd className="rounded-md border border-slate-200/90 bg-white/90 px-1.5 py-0.5 font-mono text-xs text-slate-700 shadow-sm">
              ↑
            </kbd>{" "}
            <kbd className="rounded-md border border-slate-200/90 bg-white/90 px-1.5 py-0.5 font-mono text-xs text-slate-700 shadow-sm">
              ↓
            </kbd>{" "}
            or{" "}
            <kbd className="rounded-md border border-slate-200/90 bg-white/90 px-1.5 py-0.5 font-mono text-xs text-slate-700 shadow-sm">
              1–{paths.length}
            </kbd>{" "}
            to select, then{" "}
            <kbd className="rounded-md border border-slate-200/90 bg-white/90 px-1.5 py-0.5 font-mono text-xs text-slate-700 shadow-sm">
              Enter
            </kbd>{" "}
            or{" "}
            <kbd className="rounded-md border border-slate-200/90 bg-white/90 px-1.5 py-0.5 font-mono text-xs text-slate-700 shadow-sm">
              →
            </kbd>{" "}
            to continue.
          </p>
          <div className="mt-4 flex flex-col items-stretch gap-3 border-t border-slate-200/70 pt-4 sm:gap-4 lg:flex-row lg:items-center lg:justify-between">
            <button
              type="button"
              disabled={!selectedPath}
              onClick={() => selectedPath && onSelect(selectedPath)}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-peacock-200 bg-peacock-50 px-6 py-3 text-sm font-semibold text-peacock-800 shadow-sm transition hover:bg-peacock-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {selectedPath ? `Start: ${selectedPath.label}` : "Choose a path"}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </button>
          </div>
        </div>
      </article>
    </div>
  );
};
