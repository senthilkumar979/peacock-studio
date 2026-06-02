import { sortBranchPaths } from '@peacock/shared';
import type { FlowBranch } from '@peacock/shared';
import type { FlowShareSettings } from '@/types/savedFlow';

interface ShareBranchingOptionsProps {
  branches: FlowBranch[];
  settings: FlowShareSettings;
  onChange: (settings: FlowShareSettings) => void;
}

export const ShareBranchingOptions = ({
  branches,
  settings,
  onChange,
}: ShareBranchingOptionsProps) => {
  const togglePath = (pathId: string) => {
    onChange({
      ...settings,
      enabledPathIds: settings.enabledPathIds.includes(pathId)
        ? settings.enabledPathIds.filter((id) => id !== pathId)
        : [...settings.enabledPathIds, pathId],
    });
  };

  const toggleBranch = (branchId: string) => {
    onChange({
      ...settings,
      enabledBranchIds: settings.enabledBranchIds.includes(branchId)
        ? settings.enabledBranchIds.filter((id) => id !== branchId)
        : [...settings.enabledBranchIds, branchId],
    });
  };

  return (
    <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/60 p-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        Branching paths
      </p>
      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input
          type="checkbox"
          checked={settings.includeMainFlow}
          onChange={(event) => onChange({ ...settings, includeMainFlow: event.target.checked })}
        />
        Include main flow steps
      </label>
      {branches.map((branch) => (
        <div key={branch.id} className="rounded-lg border border-slate-200 bg-white p-3">
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-800">
            <input
              type="checkbox"
              checked={settings.enabledBranchIds.includes(branch.id)}
              onChange={() => toggleBranch(branch.id)}
            />
            {branch.title}
          </label>
          <ul className="mt-2 space-y-1 pl-6">
            {sortBranchPaths(branch.paths).map((path) => (
              <li key={path.id}>
                <label className="flex items-center gap-2 text-sm text-slate-600">
                  <input
                    type="checkbox"
                    checked={settings.enabledPathIds.includes(path.id)}
                    onChange={() => togglePath(path.id)}
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
