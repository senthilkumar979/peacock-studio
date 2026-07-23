import type { ShareLinkAccessMode } from '@/utils/shareLink';
import {
  SHARE_EXPIRY_PRESETS,
  type ShareExpiryPreset,
} from '@/utils/shareExpiry';

interface ShareLinkSecurityOptionsProps {
  accessMode: ShareLinkAccessMode;
  expiryPreset: ShareExpiryPreset;
  requiresAuth: boolean;
  onExpiryPresetChange: (preset: ShareExpiryPreset) => void;
  onRequiresAuthChange: (requiresAuth: boolean) => void;
}

export const ShareLinkSecurityOptions = ({
  accessMode,
  expiryPreset,
  requiresAuth,
  onExpiryPresetChange,
  onRequiresAuthChange,
}: ShareLinkSecurityOptionsProps) => (
  <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/80 p-3">
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Link expiry</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {SHARE_EXPIRY_PRESETS.map((preset) => (
          <button
            key={preset.id}
            type="button"
            onClick={() => onExpiryPresetChange(preset.id)}
            className={`rounded-lg border px-2.5 py-1.5 text-xs font-medium transition ${
              expiryPreset === preset.id
                ? 'border-peacock-500 bg-white text-peacock-800'
                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            {preset.label}
          </button>
        ))}
      </div>
    </div>

    {accessMode === 'readonly' ? (
      <label className="flex cursor-pointer items-start gap-2.5">
        <input
          type="checkbox"
          checked={requiresAuth}
          onChange={(event) => onRequiresAuthChange(event.target.checked)}
          className="mt-0.5 h-4 w-4 rounded border-slate-300 text-peacock-600 focus:ring-peacock-500"
        />
        <span>
          <span className="block text-sm font-medium text-slate-800">
            Require sign-in to view
          </span>
          <span className="mt-0.5 block text-xs text-slate-500">
            Viewers must sign in with Clerk before shared content loads.
          </span>
        </span>
      </label>
    ) : null}
  </div>
);
