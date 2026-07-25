import type { HealthCheckMethod } from '@/types/health';

interface HealthCheckMethodDetailsProps {
  method: HealthCheckMethod;
}

const SECTIONS = [
  { key: 'what', label: 'What is checked' },
  { key: 'how', label: 'How it is checked' },
  { key: 'interpret', label: 'How to interpret' },
] as const;

export const HealthCheckMethodDetails = ({ method }: HealthCheckMethodDetailsProps) => (
  <div className="mt-3 space-y-3 rounded-xl bg-slate-50 px-3 py-3 ring-1 ring-slate-200/80">
    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
      Admin method detail
    </p>
    {SECTIONS.map(({ key, label }) => (
      <div key={key}>
        <p className="text-xs font-semibold text-slate-800">{label}</p>
        <p className="mt-0.5 text-sm leading-relaxed text-slate-600">{method[key]}</p>
      </div>
    ))}
  </div>
);
