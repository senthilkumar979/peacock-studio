import type { ReactElement } from 'react';

interface ActionTooltipProps {
  label: string;
  children: ReactElement;
  side?: 'top' | 'bottom';
  /** Wider hint for disabled/long explanations */
  wide?: boolean;
}

/** Hover/focus tooltip for icon actions in library and chrome. */
export const ActionTooltip = ({
  label,
  children,
  side = 'top',
  wide = false,
}: ActionTooltipProps) => (
  <span className="group/tooltip relative inline-flex">
    {children}
    <span
      role="tooltip"
      className={`pointer-events-none absolute left-1/2 z-40 -translate-x-1/2 rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-center text-[11px] font-medium leading-snug text-white opacity-0 shadow-lg transition-opacity group-hover/tooltip:opacity-100 group-focus-within/tooltip:opacity-100 ${
        side === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'
      } ${wide ? 'w-44 whitespace-normal' : 'whitespace-nowrap'}`}
    >
      {label}
    </span>
  </span>
);
