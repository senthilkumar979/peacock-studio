import { GitBranch, Plus, Trash2 } from 'lucide-react';
import {
  formatPathStepRange,
  getBranchPresentation,
  sortBranchPaths,
  type FlowBranch,
} from '@peacock/shared';
import { getFlowDocument } from '@/services/flowLibraryService';
import { useFlowStore } from '@/store/flowStore';
import { useEffect, useState } from 'react';

interface BranchPanelProps {
  branch: FlowBranch;
  onAddPath: () => void;
}

export const BranchPanel = ({ branch, onAddPath }: BranchPanelProps) => {
  const updateBranchTitle = useFlowStore((state) => state.updateBranchTitle);
  const updateBranchDescription = useFlowStore((state) => state.updateBranchDescription);
  const updateBranchPresentation = useFlowStore((state) => state.updateBranchPresentation);
  const updatePathLabel = useFlowStore((state) => state.updatePathLabel);
  const removePathFromBranch = useFlowStore((state) => state.removePathFromBranch);
  const deleteOutlineItem = useFlowStore((state) => state.deleteOutlineItem);
  const [rangeLabels, setRangeLabels] = useState<Record<string, string>>({});

  const paths = sortBranchPaths(branch.paths);
  const presentation = getBranchPresentation(branch);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const labels: Record<string, string> = {};
      for (const path of paths) {
        const doc = await getFlowDocument(path.targetDocumentId);
        labels[path.id] = doc
          ? formatPathStepRange(doc.steps, path.fromStepId, path.toStepId)
          : 'Unavailable';
      }
      if (!cancelled) setRangeLabels(labels);
    })();
    return () => {
      cancelled = true;
    };
  }, [paths]);

  return (
    <div className="flex h-full flex-col gap-4 overflow-y-auto">
      <div className="flex items-center gap-2 text-brand-violet">
        <GitBranch className="h-4 w-4" aria-hidden />
        <h2 className="text-sm font-semibold uppercase tracking-wide">Branch</h2>
      </div>

      <label className="block text-sm font-medium text-slate-700">
        Title
        <input
          value={branch.title}
          onChange={(event) => updateBranchTitle(branch.id, event.target.value)}
          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
        />
      </label>

      <label className="block text-sm font-medium text-slate-700">
        Description
        <textarea
          value={branch.description}
          onChange={(event) => updateBranchDescription(branch.id, event.target.value)}
          rows={3}
          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
        />
      </label>

      <label className="block text-sm font-medium text-slate-700">
        Layout
        <select
          value={presentation}
          onChange={(event) =>
            updateBranchPresentation(branch.id, event.target.value as 'list' | 'grid')
          }
          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
        >
          <option value="list">List</option>
          <option value="grid">Grid (4+ options)</option>
        </select>
      </label>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-slate-800">Paths ({paths.length})</p>
          <button
            type="button"
            onClick={onAddPath}
            className="inline-flex items-center gap-1 rounded-lg border border-peacock-200 bg-peacock-50 px-2 py-1 text-xs font-medium text-peacock-800"
          >
            <Plus className="h-3.5 w-3.5" aria-hidden />
            Add path
          </button>
        </div>

        {paths.map((path) => (
          <div key={path.id} className="rounded-lg border border-slate-200 bg-white p-3">
            <input
              value={path.label}
              onChange={(event) => updatePathLabel(branch.id, path.id, event.target.value)}
              className="w-full rounded-md border border-slate-200 px-2 py-1.5 text-sm font-medium"
            />
            <p className="mt-2 text-xs text-slate-500">{path.targetTitle}</p>
            <p className="text-xs text-slate-400">{rangeLabels[path.id] ?? '…'}</p>
            <button
              type="button"
              onClick={() => removePathFromBranch(branch.id, path.id)}
              className="mt-2 inline-flex items-center gap-1 text-xs text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-3 w-3" aria-hidden />
              Remove path
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => deleteOutlineItem(branch.id)}
        className="mt-auto rounded-lg border border-red-200 px-3 py-2 text-sm text-red-700 hover:bg-red-50"
      >
        Delete branch
      </button>
    </div>
  );
};
