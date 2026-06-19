import { Info } from 'lucide-react';
import { getCaptureFieldTooltip } from './captureFieldTooltips';

interface CaptureFieldLabelProps {
  label: string;
  className?: string;
}

export const CaptureFieldLabel = ({ label, className }: CaptureFieldLabelProps) => {
  const tooltip = getCaptureFieldTooltip(label);

  if (!tooltip) {
    return <dt className={className ?? 'text-xs font-medium text-slate-500'}>{label}</dt>;
  }

  return (
    <dt className={`flex items-center gap-1 ${className ?? 'text-xs font-medium text-slate-500'}`}>
      <span>{label}</span>
      <span className="relative inline-flex">
        <button
          type="button"
          className="peer inline-flex rounded-full p-0.5 text-slate-400 transition hover:text-peacock-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-peacock-500 focus-visible:ring-offset-1"
          aria-label={`About ${label}`}
        >
          <Info className="h-3.5 w-3.5" aria-hidden />
        </button>
        <span
          role="tooltip"
          className="pointer-events-none absolute bottom-full left-1/2 z-30 mb-2 hidden w-56 -translate-x-1/2 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-left text-[11px] font-normal leading-relaxed text-white shadow-xl peer-hover:block peer-focus:block"
        >
          {tooltip}
        </span>
      </span>
    </dt>
  );
};
