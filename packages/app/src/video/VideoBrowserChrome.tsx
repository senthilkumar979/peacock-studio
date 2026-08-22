import type { ReactNode } from 'react';

interface VideoBrowserChromeProps {
  url: string;
  children: ReactNode;
}

export const VideoBrowserChrome = ({ url, children }: VideoBrowserChromeProps) => (
  <div className="flex h-full w-full flex-col overflow-hidden rounded-2xl bg-slate-800">
    <div className="flex shrink-0 items-center gap-3 px-4 py-3">
      <div className="flex shrink-0 items-center gap-1.5" aria-hidden>
        <span className="h-3 w-3 rounded-full bg-red-400" />
        <span className="h-3 w-3 rounded-full bg-amber-300" />
        <span className="h-3 w-3 rounded-full bg-emerald-400" />
      </div>
      <div className="min-w-0 flex-1 overflow-hidden rounded-lg bg-slate-900 px-3 py-1.5 text-left text-sm text-slate-300">
        {url || 'about:blank'}
      </div>
    </div>
    <div className="relative min-h-0 flex-1 overflow-hidden bg-slate-950">{children}</div>
  </div>
);
