import { motion } from 'framer-motion'
import { PEACOCK_APP_NAME, PEACOCK_LOGO_SRC } from '@/constants/branding'
import { getGreeting } from '@/utils/dashboardLibrary'
import type { DashboardStats as DashboardStatsModel } from '@/utils/dashboardStats'

interface DashboardHeroProps {
  stats: DashboardStatsModel
  documentCount: number
}

export const DashboardHero = ({ stats, documentCount }: DashboardHeroProps) => (
  <section className="relative overflow-hidden bg-gradient-to-br from-peacock-700 via-peacock-800 to-brand-violet px-6 pb-24 pt-10">
    <motion.div
      aria-hidden
      className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-3xl"
      animate={{ scale: [1, 1.08, 1], opacity: [0.35, 0.5, 0.35] }}
      transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
    />
    <motion.div
      aria-hidden
      className="pointer-events-none absolute -bottom-20 left-1/4 h-56 w-56 rounded-full bg-brand-cyan/20 blur-3xl"
      animate={{ scale: [1, 1.12, 1], opacity: [0.25, 0.4, 0.25] }}
      transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
    />

    <div className="relative mx-auto flex w-full max-w-7xl flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="max-w-2xl"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.05 }}
          className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-lg font-medium text-white/90 backdrop-blur-sm"
        >
          <img
            src={PEACOCK_LOGO_SRC}
            alt=""
            width={18}
            height={18}
            className="h-[56px] w-[56px] object-contain"
          />
          {PEACOCK_APP_NAME}
        </motion.div>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Documentation workspace
        </h1>
        <p className="mt-3 max-w-xl text-base leading-relaxed text-peacock-100/90">
          Capture flows with the browser extension, refine them in the editor,
          and share polished step-by-step guides — all stored locally on this
          device.
        </p>
      </motion.div>

      {/* <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.1 }}
        className="grid gap-3 sm:grid-cols-3 lg:max-w-md"
      >
        <HeroChip label="Documentations" value={documentCount} />
        <HeroChip label="This week" value={stats.totalThisWeek} />
        <HeroChip label="Steps captured" value={stats.totalStepsDocumented} />
      </motion.div> */}
    </div>
  </section>
)

interface HeroChipProps {
  label: string
  value: number
}

const HeroChip = ({ label, value }: HeroChipProps) => (
  <motion.div
    whileHover={{ y: -2 }}
    className="rounded-xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-md"
  >
    <p className="text-xs font-medium uppercase tracking-wide text-peacock-100/80">
      {label}
    </p>
    <p className="mt-1 text-2xl font-semibold tabular-nums text-white">
      {value}
    </p>
  </motion.div>
)
