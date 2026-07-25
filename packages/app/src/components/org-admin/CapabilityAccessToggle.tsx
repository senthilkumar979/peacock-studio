import { Check, X } from 'lucide-react';
import type { CapabilityKey } from '@/cloud/types/organization';
import { CAPABILITY_LABELS } from '@/components/org-admin/memberAdminHelpers';

interface CapabilityAccessToggleProps {
  capability: CapabilityKey;
  active: boolean;
  disabled?: boolean;
  onToggle?: () => void;
}

export const CapabilityAccessToggle = ({
  capability,
  active,
  disabled = false,
  onToggle,
}: CapabilityAccessToggleProps) => {
  const meta = CAPABILITY_LABELS[capability];
  const interactive = Boolean(onToggle) && !disabled;

  return (
    <button
      type="button"
      disabled={!interactive}
      title={`${meta.label}: ${active ? 'Allowed' : 'Off'} — ${meta.hint}`}
      aria-label={`${meta.label} ${active ? 'allowed' : 'denied'}`}
      onClick={() => onToggle?.()}
      className={`inline-flex h-8 w-8 items-center justify-center rounded-lg transition ${
        active
          ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100'
          : 'bg-slate-50 text-slate-400 ring-1 ring-slate-200'
      } ${interactive ? 'hover:brightness-95 cursor-pointer' : 'cursor-default'}`}
    >
      {active ? <Check className="h-4 w-4" aria-hidden /> : <X className="h-4 w-4" aria-hidden />}
    </button>
  );
};
