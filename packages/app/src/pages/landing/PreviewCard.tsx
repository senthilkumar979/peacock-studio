import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';

interface PreviewCardProps {
  label: string;
  caption: string;
  icon: LucideIcon;
  accentClass: string;
  index: number;
  children: ReactNode;
}

export const PreviewCard = ({
  label,
  caption,
  icon: Icon,
  accentClass,
  index,
  children,
}: PreviewCardProps) => (
  <motion.article
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.35 }}
    transition={{ delay: index * 0.08, duration: 0.4 }}
    whileHover={{ y: -4 }}
    className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg shadow-slate-200/50 transition-shadow hover:shadow-xl hover:shadow-slate-200/60"
  >
    <div className={accentClass} />
    <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-peacock-700" aria-hidden />
        <p className="text-sm font-semibold text-slate-900">{label}</p>
      </div>
      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
        Live app
      </span>
    </div>
    <div className="flex-1">{children}</div>
    <p className="border-t border-slate-100 px-4 py-3 text-xs leading-relaxed text-slate-500">
      {caption}
    </p>
  </motion.article>
);

export const PreviewBrowserChrome = ({ url }: { url: string }) => (
  <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-50 px-3 py-2">
    <span className="h-2 w-2 rounded-full bg-red-400/80" aria-hidden />
    <span className="h-2 w-2 rounded-full bg-amber-400/80" aria-hidden />
    <span className="h-2 w-2 rounded-full bg-emerald-400/80" aria-hidden />
    <span className="ml-1 truncate text-[10px] text-slate-400">{url}</span>
  </div>
);
