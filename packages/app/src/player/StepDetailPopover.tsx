import { motion } from 'framer-motion'
import type { PopoverArrowSide } from './getPopoverPlacement'

type StepDetailAppearance = 'default' | 'glass'

interface StepDetailPopoverProps {
  stepNumber: number
  title: string
  description: string
  className?: string
  showArrow?: boolean
  arrowSide?: PopoverArrowSide
  appearance?: StepDetailAppearance
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
  appearance = 'default',
}: StepDetailPopoverProps) => {
  const isGlass = appearance === 'glass'

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      className={`relative w-[min(100%,32rem)] ${isGlass ? 'min-w-0 w-full' : 'min-w-[18rem]'} ${className}`}
      role="status"
      aria-live="polite"
    >
      {showArrow ? <PopoverArrow side={arrowSide} /> : null}

      <div
        className={
          isGlass
            ? 'overflow-hidden rounded-2xl border border-white/50 bg-white/75 shadow-[0_16px_40px_-12px_rgba(15,23,42,0.35)] ring-1 ring-slate-900/5 backdrop-blur-xl backdrop-saturate-150'
            : 'overflow-hidden rounded-2xl bg-white shadow-[0_22px_48px_-14px_rgba(15,23,42,0.28)] ring-1 ring-slate-900/[0.07]'
        }
      >
        {!isGlass ? (
          <div
            className="h-1 bg-gradient-to-r from-peacock-600 via-brand-violet to-brand-cyan"
            aria-hidden
          />
        ) : null}

        <div className={isGlass ? 'px-4 py-3.5 sm:px-5 sm:py-4' : 'px-5 pb-5 pt-4'}>
          <div className="flex items-start gap-3">
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white shadow-md ${
                isGlass
                  ? 'bg-gradient-to-br from-peacock-600/95 to-brand-violet/95 shadow-peacock-600/20'
                  : 'bg-gradient-to-br from-peacock-600 to-brand-violet shadow-peacock-600/25'
              }`}
              aria-hidden
            >
              <span className="text-sm font-bold leading-none tabular-nums">{stepNumber}</span>
            </div>

            <div className="min-w-0 flex-1">
              <h3
                className={`font-semibold leading-snug tracking-tight text-slate-900 ${
                  isGlass ? 'text-base' : 'mt-1 text-[1.05rem]'
                }`}
              >
                {title}
              </h3>
            </div>
          </div>

          {description ? (
            <div
              className={
                isGlass
                  ? 'mt-3 max-h-28 overflow-y-auto rounded-xl border border-white/60 bg-white/50 px-3 py-2.5'
                  : 'mt-4 rounded-xl border border-slate-100 bg-slate-50/80 px-4 py-3'
              }
            >
              {!isGlass ? (
                <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                  Details
                </p>
              ) : null}
              <p
                className={`text-sm leading-relaxed text-slate-700 ${
                  isGlass ? '' : 'mt-1.5 text-slate-600'
                }`}
              >
                {description}
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </motion.div>
  )
}
