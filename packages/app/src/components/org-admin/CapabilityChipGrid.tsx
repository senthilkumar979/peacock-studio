import type { CapabilityKey, MemberCapabilities } from '@/cloud/types/organization';
import { CAPABILITY_KEYS } from '@/cloud/types/organization';
import { CAPABILITY_LABELS } from '@/components/org-admin/memberAdminHelpers';

interface CapabilityChipGridProps {
  value: MemberCapabilities;
  onChange?: (next: MemberCapabilities) => void;
  disabled?: boolean;
  readOnly?: boolean;
}

export const CapabilityChipGrid = ({
  value,
  onChange,
  disabled = false,
  readOnly = false,
}: CapabilityChipGridProps) => (
  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
    {CAPABILITY_KEYS.map((key: CapabilityKey) => {
      const active = value[key];
      const meta = CAPABILITY_LABELS[key];
      const interactive = Boolean(onChange) && !readOnly && !disabled;

      return (
        <button
          key={key}
          type="button"
          disabled={!interactive}
          title={meta.hint}
          onClick={() => {
            if (!onChange || !interactive) return;
            onChange({ ...value, [key]: !active });
          }}
          className={`group relative rounded-xl border px-3 py-2.5 text-left transition ${
            active
              ? 'border-peacock-300/80 bg-gradient-to-br from-peacock-50 to-white shadow-sm shadow-peacock-500/10 ring-1 ring-peacock-200/60'
              : 'border-slate-200/80 bg-slate-50/80 text-slate-500'
          } ${interactive ? 'hover:border-peacock-300 hover:shadow-sm cursor-pointer' : 'cursor-default'}`}
        >
          <span
            className={`block text-xs font-semibold tracking-wide ${
              active ? 'text-peacock-800' : 'text-slate-500'
            }`}
          >
            {meta.label}
          </span>
          <span
            className={`mt-0.5 block text-[10px] leading-tight ${
              active ? 'text-peacock-600/80' : 'text-slate-400'
            }`}
          >
            {active ? 'Allowed' : 'Off'}
          </span>
          <span
            aria-hidden
            className={`absolute right-2 top-2 h-1.5 w-1.5 rounded-full ${
              active ? 'bg-peacock-500' : 'bg-slate-300'
            }`}
          />
        </button>
      );
    })}
  </div>
);
