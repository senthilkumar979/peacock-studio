import type { FlowDocumentStatus } from '@/types/savedFlow';
import { Loader2 } from 'lucide-react';
import { ActionTooltip } from '@/components/ui/ActionTooltip';

interface FlowDocumentStatusSwitchProps {
  value: FlowDocumentStatus;
  onChange: (next: FlowDocumentStatus) => void;
  disabled?: boolean;
  isLoading?: boolean;
  /** Compact for chrome headers; default shows Draft/Live labels */
  size?: 'sm' | 'md';
}

export const FlowDocumentStatusSwitch = ({
  value,
  onChange,
  disabled = false,
  isLoading = false,
  size = 'md',
}: FlowDocumentStatusSwitchProps) => {
  const isLive = value === 'live';
  const isDisabled = disabled || isLoading;
  const tooltip = isLoading
    ? 'Updating status…'
    : isLive
      ? 'Live — can be shared publicly. Click to set Draft.'
      : 'Draft — not shareable publicly. Click to publish Live.';

  return (
    <ActionTooltip label={tooltip} wide side="bottom">
      <button
        type="button"
        role="switch"
        aria-checked={isLive}
        aria-busy={isLoading}
        aria-label={
          isLoading ? 'Updating status' : isLive ? 'Status: Live' : 'Status: Draft'
        }
        disabled={isDisabled}
        onClick={() => onChange(isLive ? 'draft' : 'live')}
        className={`inline-flex items-center gap-2 rounded-full border transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-peacock-500 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 ${
          isLive
            ? 'border-emerald-300 bg-emerald-50 text-emerald-900'
            : 'border-amber-300 bg-amber-50 text-amber-900'
        } ${size === 'sm' ? 'px-2.5 py-1.5' : 'px-3 py-2'}`}
      >
        {isLoading ? (
          <>
            <Loader2
              className={`animate-spin shrink-0 ${size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4'}`}
              aria-hidden
            />
            <span className={`font-semibold ${size === 'sm' ? 'text-xs' : 'text-sm'}`}>
              Saving…
            </span>
          </>
        ) : (
          <>
            <span
              aria-hidden
              className={`relative inline-flex shrink-0 rounded-full transition-colors ${
                size === 'sm' ? 'h-4 w-7' : 'h-5 w-9'
              } ${isLive ? 'bg-emerald-500' : 'bg-amber-400'}`}
            >
              <span
                className={`absolute top-0.5 rounded-full bg-white shadow transition-transform ${
                  size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'
                } ${
                  isLive
                    ? size === 'sm'
                      ? 'translate-x-3.5'
                      : 'translate-x-4'
                    : 'translate-x-0.5'
                }`}
              />
            </span>
            <span className={`font-semibold ${size === 'sm' ? 'text-xs' : 'text-sm'}`}>
              {isLive ? 'Live' : 'Draft'}
            </span>
          </>
        )}
      </button>
    </ActionTooltip>
  );
};
