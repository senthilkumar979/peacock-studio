import type { ReactNode } from 'react';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X } from 'lucide-react';

type FirstTimeTooltipPlacement = 'bottom' | 'bottom-start' | 'top';

interface FirstTimeTooltipProps {
  isOpen: boolean;
  title: string;
  description: string;
  stepLabel?: string;
  placement?: FirstTimeTooltipPlacement;
  onDismiss: () => void;
  children: ReactNode;
}

interface TooltipPosition {
  top: number;
  left: number;
}

function measurePosition(
  anchor: HTMLElement,
  placement: FirstTimeTooltipPlacement,
): TooltipPosition {
  const rect = anchor.getBoundingClientRect();
  const tooltipWidth = 288;

  if (placement === 'top') {
    return { top: rect.top - 12, left: rect.left };
  }

  if (placement === 'bottom') {
    return {
      top: rect.bottom + 12,
      left: rect.left + rect.width / 2 - tooltipWidth / 2,
    };
  }

  return { top: rect.bottom + 12, left: rect.left };
}

export const FirstTimeTooltip = ({
  isOpen,
  title,
  description,
  stepLabel,
  placement = 'bottom-start',
  onDismiss,
  children,
}: FirstTimeTooltipProps) => {
  const anchorRef = useRef<HTMLSpanElement>(null);
  const [position, setPosition] = useState<TooltipPosition | null>(null);

  useEffect(() => {
    if (!isOpen || !anchorRef.current) {
      setPosition(null);
      return;
    }

    const updatePosition = () => {
      if (!anchorRef.current) return;
      setPosition(measurePosition(anchorRef.current, placement));
    };

    updatePosition();
    anchorRef.current.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [isOpen, placement]);

  const tooltip =
    isOpen && position
      ? createPortal(
          <AnimatePresence>
            <motion.div
              role="tooltip"
              initial={{ opacity: 0, y: -6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              style={{
                position: 'fixed',
                top: placement === 'top' ? undefined : position.top,
                bottom: placement === 'top' ? window.innerHeight - position.top : undefined,
                left: Math.max(16, Math.min(position.left, window.innerWidth - 304)),
                zIndex: 90,
              }}
              className="w-72"
            >
              <div className="rounded-xl border border-peacock-200 bg-slate-900 px-4 py-3.5 text-left shadow-2xl shadow-slate-900/30">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    {stepLabel ? (
                      <p className="text-[10px] font-bold uppercase tracking-wider text-peacock-300">
                        {stepLabel}
                      </p>
                    ) : null}
                    <p className="mt-0.5 flex items-center gap-1.5 text-sm font-semibold text-white">
                      <Sparkles className="h-3.5 w-3.5 shrink-0 text-peacock-300" aria-hidden />
                      {title}
                    </p>
                    <p className="mt-1.5 text-xs leading-relaxed text-slate-300">{description}</p>
                  </div>
                  <button
                    type="button"
                    onClick={onDismiss}
                    className="shrink-0 rounded-md p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
                    aria-label="Dismiss tip"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={onDismiss}
                  className="mt-3 rounded-lg bg-peacock-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-peacock-400"
                >
                  Got it
                </button>
              </div>
            </motion.div>
          </AnimatePresence>,
          document.body,
        )
      : null;

  return (
    <>
      <span ref={anchorRef} className="relative inline-flex max-w-full">
        <span
          className={
            isOpen
              ? 'relative rounded-xl ring-2 ring-peacock-400/80 ring-offset-2 ring-offset-white'
              : undefined
          }
        >
          {children}
          {isOpen ? (
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 animate-pulse rounded-xl ring-2 ring-peacock-300/50"
            />
          ) : null}
        </span>
      </span>
      {tooltip}
    </>
  );
};
