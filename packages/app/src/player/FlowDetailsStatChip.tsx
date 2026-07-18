import type { LucideIcon } from 'lucide-react';

interface FlowDetailsStatChipProps {
  icon: LucideIcon;
  label: string;
  value: string;
}

export const FlowDetailsStatChip = ({ icon: Icon, label, value }: FlowDetailsStatChipProps) => (
  <div className="flex min-w-0 items-center gap-2.5 rounded-xl border border-white/70 bg-white/80 px-3 py-2.5 shadow-sm ring-1 ring-slate-200/60 backdrop-blur-sm">
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-peacock-50 to-brand-violet/10 text-peacock-700 ring-1 ring-peacock-100/80">
      <Icon className="h-3.5 w-3.5" aria-hidden />
    </span>
    <div className="min-w-0">
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">{label}</p>
      <p className="truncate text-sm font-semibold text-slate-900">{value}</p>
    </div>
  </div>
);
