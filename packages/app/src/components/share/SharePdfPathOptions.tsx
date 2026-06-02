import { sortBranchPaths, type FlowBranch } from '@peacock/shared';
import type { PdfPathSelections } from '@/utils/pdfPathSelection';

interface SharePdfPathOptionsProps {
  branches: FlowBranch[];
  selections: PdfPathSelections;
  onChange: (selections: PdfPathSelections) => void;
}

export const SharePdfPathOptions = ({
  branches,
  selections,
  onChange,
}: SharePdfPathOptionsProps) => {
  const selectPath = (branchId: string, pathId: string) => {
    onChange({ ...selections, [branchId]: pathId });
  };

  return (
    <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/60 p-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        Paths to include
      </p>
      <p className="text-xs text-slate-500">
        Select one path per branch. The PDF highlights each branch point, then continues with steps
        from the chosen path.
      </p>
      {branches.map((branch) => (
        <div key={branch.id} className="rounded-lg border border-slate-200 bg-white p-3">
          <p className="text-sm font-semibold text-slate-800">{branch.title}</p>
          <ul className="mt-2 space-y-1">
            {sortBranchPaths(branch.paths).map((path) => (
              <li key={path.id}>
                <label className="flex items-center gap-2 text-sm text-slate-600">
                  <input
                    type="radio"
                    name={`pdf-path-${branch.id}`}
                    checked={selections[branch.id] === path.id}
                    onChange={() => selectPath(branch.id, path.id)}
                  />
                  {path.label}
                </label>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};
