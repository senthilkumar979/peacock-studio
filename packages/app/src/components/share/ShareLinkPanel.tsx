import type { FlowBranch } from '@peacock/shared';
import type { FlowShareSettings } from '@/types/savedFlow';
import { ShareBranchingOptions } from '@/components/share/ShareBranchingOptions';
import type { ShareLinkAccessMode } from '@/utils/shareLink';

interface ShareLinkPanelProps {
  accessMode: ShareLinkAccessMode;
  shareUrl: string;
  usesTokenLinks?: boolean;
  isShareUrlLoading?: boolean;
  hasBranches: boolean;
  branches: FlowBranch[];
  branchSettings: FlowShareSettings;
  onAccessModeChange: (mode: ShareLinkAccessMode) => void;
  onBranchSettingsChange: (settings: FlowShareSettings) => void;
}

export const ShareLinkPanel = ({
  accessMode,
  shareUrl,
  usesTokenLinks = false,
  isShareUrlLoading = false,
  hasBranches,
  branches,
  branchSettings,
  onAccessModeChange,
  onBranchSettingsChange,
}: ShareLinkPanelProps) => (
  <div className="space-y-4">
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Link access</p>
      <div className="mt-2 grid grid-cols-2 gap-2">
        {(['readonly', 'editable'] as const).map((mode) => (
          <button
            key={mode}
            type="button"
            onClick={() => onAccessModeChange(mode)}
            className={`rounded-lg border px-3 py-2 text-sm font-medium transition ${
              accessMode === mode
                ? 'border-peacock-500 bg-peacock-50 text-peacock-800'
                : 'border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            {mode === 'readonly' ? 'Read-only' : 'Editable'}
          </button>
        ))}
      </div>
      <p className="mt-2 text-xs text-slate-500">
        {accessMode === 'readonly'
          ? usesTokenLinks
            ? 'Anyone with the link can view this guide without signing in.'
            : 'Viewers can read the guide but cannot edit it.'
          : usesTokenLinks
            ? 'Signed-in workspace members can open the editor via this link.'
            : 'Anyone with the link can open the editor for this doc.'}
      </p>
    </div>

    {hasBranches && accessMode === 'readonly' ? (
      <ShareBranchingOptions
        branches={branches}
        settings={branchSettings}
        onChange={onBranchSettingsChange}
      />
    ) : null}

    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Link preview</p>
      <p className="mt-2 break-all rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700">
        {isShareUrlLoading ? 'Generating share link…' : shareUrl || 'Share link unavailable'}
      </p>
    </div>
  </div>
);
