import { motion } from 'framer-motion'
import type { PopoverArrowSide } from './getPopoverPlacement'

interface StepDetailPopoverProps {
  stepNumber: number
  title: string
  description: string
  className?: string
  showArrow?: boolean
  arrowSide?: PopoverArrowSide
}

const ARROW_OFFSET_BY_SIDE: Record<PopoverArrowSide, string> = {
  top: 'absolute -top-[7px] left-1/2 h-3.5 w-3.5 -translate-x-1/2',
  bottom: 'absolute -bottom-[7px] left-1/2 h-3.5 w-3.5 -translate-x-1/2',
  left: 'absolute -left-[7px] top-1/2 h-3.5 w-3.5 -translate-y-1/2',
  right: 'absolute -right-[7px] top-1/2 h-3.5 w-3.5 -translate-y-1/2',
}

const PopoverArrow = ({ side }: { side: PopoverArrowSide }) => (
  <div
    className={`${ARROW_OFFSET_BY_SIDE[side]} rotate-45 rounded-sm bg-white shadow-sm ring-1 ring-slate-900/[0.06]`}
    aria-hidden
  />
)

export const StepDetailPopover = ({
  stepNumber,
  title,
  description,
  className = '',
  showArrow = false,
  arrowSide = 'top',
}: StepDetailPopoverProps) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.97 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
    className={`relative w-[min(100%,32rem)] min-w-[18rem] ${className}`}
    role="status"
    aria-live="polite"
  >
    {showArrow ? <PopoverArrow side={arrowSide} /> : null}

    <div className="overflow-hidden rounded-2xl bg-white shadow-[0_22px_48px_-14px_rgba(15,23,42,0.28)] ring-1 ring-slate-900/[0.07]">
      <div
        className="h-1 bg-gradient-to-r from-peacock-600 via-brand-violet to-brand-cyan"
        aria-hidden
      />

      <div className="px-5 pb-5 pt-4">
        <div className="flex items-start gap-3.5">
          <div
            className="flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-xl bg-gradient-to-br from-peacock-600 to-brand-violet text-white shadow-md shadow-peacock-600/25"
            aria-hidden
          >
            {/* <span className="text-[9px] font-medium uppercase leading-none tracking-widest opacity-80">
              Step
            </span> */}
            <span className="mt-0.5 text-sm font-bold leading-none tabular-nums">
              {stepNumber}
            </span>
          </div>

          <div className="min-w-0 flex-1 pt-0.5">
            {/* <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
              Instruction
            </p> */}
            <h3 className="mt-1 text-[1.05rem] font-semibold leading-snug tracking-tight text-slate-900">
              {title}
            </h3>
          </div>
        </div>

        {description ? (
          <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50/80 px-4 py-3">
            <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
              Details
            </p>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
              {description}
            </p>
          </div>
        ) : null}
      </div>
    </div>
  </motion.div>
)
