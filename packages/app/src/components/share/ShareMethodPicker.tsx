import { Code2, FileDown, Link2 } from 'lucide-react';

export type ShareMethod = 'embed' | 'pdf' | 'link';

interface ShareMethodPickerProps {
  value: ShareMethod;
  onChange: (method: ShareMethod) => void;
  disabled?: boolean;
  disabledMethods?: Partial<Record<ShareMethod, boolean>>;
  /** Shown under the label when a method is disabled. */
  disabledReasons?: Partial<Record<ShareMethod, string>>;
}

const OPTIONS: Array<{
  id: ShareMethod;
  label: string;
  description: string;
  icon: typeof Link2;
}> = [
  {
    id: 'embed',
    label: 'Embed code',
    description: 'Add this guide to your site',
    icon: Code2,
  },
  {
    id: 'pdf',
    label: 'Export as PDF',
    description: 'Download a printable guide',
    icon: FileDown,
  },
  {
    id: 'link',
    label: 'Share as link',
    description: 'Copy a URL to open this doc',
    icon: Link2,
  },
];

export const ShareMethodPicker = ({
  value,
  onChange,
  disabled = false,
  disabledMethods = {},
  disabledReasons = {},
}: ShareMethodPickerProps) => (
  <div className="grid gap-2 sm:grid-cols-3">
    {OPTIONS.map((option) => {
      const Icon = option.icon;
      const isSelected = value === option.id;
      const methodDisabled = Boolean(disabledMethods[option.id]);
      const reason = disabledReasons[option.id];
      return (
        <button
          key={option.id}
          type="button"
          disabled={disabled || methodDisabled}
          onClick={() => onChange(option.id)}
          title={methodDisabled ? reason : undefined}
          className={`rounded-xl border px-3 py-3 text-left transition disabled:cursor-not-allowed disabled:opacity-50 ${
            isSelected
              ? 'border-peacock-500 bg-peacock-50 ring-2 ring-peacock-500/20'
              : 'border-slate-200 bg-white hover:border-slate-300'
          }`}
        >
          <Icon
            className={`h-5 w-5 ${isSelected ? 'text-peacock-700' : 'text-slate-500'}`}
            aria-hidden
          />
          <p className="mt-2 text-sm font-semibold text-slate-900">{option.label}</p>
          <p className="mt-1 text-xs text-slate-500">
            {methodDisabled ? reason || 'Not available right now' : option.description}
          </p>
        </button>
      );
    })}
  </div>
);
