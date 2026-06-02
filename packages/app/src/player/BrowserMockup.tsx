import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface BrowserMockupProps {
  url: string;
  children: ReactNode;
  isFluid?: boolean;
}

function getDisplayUrl(url: string): string {
  if (!url) return 'about:blank';

  try {
    return new URL(url).href;
  } catch {
    return url;
  }
}

export const BrowserMockup = ({
  url,
  children,
  isFluid = false,
}: BrowserMockupProps) => {
  const displayUrl = getDisplayUrl(url);

  return (
    <div
      className={`flex flex-col overflow-hidden rounded-xl bg-slate-800 ring-1 ring-slate-900/10 ${
        isFluid
          ? "w-full max-w-full shadow-xl"
          : "mx-auto w-fit max-w-[calc(100vw-2rem)] shadow-2xl"
      }`}
    >
      <div className="flex shrink-0 items-center gap-3 border-b border-slate-700/80 bg-slate-800 px-4 py-3">
        <div className="flex shrink-0 items-center gap-1.5" aria-hidden>
          <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
          <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
          <span className="h-3 w-3 rounded-full bg-[#28c840]" />
        </div>
        <div
          className="flex min-w-0 flex-1 items-center gap-2 rounded-lg bg-slate-900/60 px-3 py-1.5 text-xs text-slate-300"
          title={url}
        >
          <svg
            className="h-3 w-3 shrink-0 text-slate-500"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden
          >
            <path d="M12 1a5 5 0 00-5 5v3H6a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2v-8a2 2 0 00-2-2h-1V6a5 5 0 00-5-5zm-3 8V6a3 3 0 116 0v3H9z" />
          </svg>
          <motion.span
            key={url}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="min-w-0 max-w-[85%] truncate font-medium"
          >
            {displayUrl}
          </motion.span>
        </div>
      </div>
      <div className={`relative bg-slate-100 ${isFluid ? "w-full" : ""}`}>
        {children}
      </div>
    </div>
  );
};
