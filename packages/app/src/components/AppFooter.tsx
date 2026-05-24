import { Copyright } from 'lucide-react';
import { PEACOCK_APP_NAME } from '@/constants/branding';

export const AppFooter = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-slate-200/80 bg-white/60 py-4 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-center gap-1 px-6 text-center sm:flex-row sm:justify-between sm:text-left">
        <p className="inline-flex flex-wrap items-center justify-center gap-1.5 text-xs text-slate-500">
          <Copyright className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden />
          <span className="font-medium text-slate-600">{year}</span>
          <span>{PEACOCK_APP_NAME}</span>
          <span className="text-slate-400">·</span>
          <span>Documentation stored locally on this device</span>
        </p>
      </div>
    </footer>
  );
};
