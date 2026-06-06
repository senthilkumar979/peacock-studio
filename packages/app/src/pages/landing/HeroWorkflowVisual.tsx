import { motion } from 'framer-motion';
import { CircleDot, GitBranch, Layers3, MousePointerClick } from 'lucide-react';

const CARDS = [
  {
    id: 'capture',
    label: 'Extension capture',
    detail: 'Click · Input · Navigate',
    icon: MousePointerClick,
    x: '4%',
    y: '8%',
    delay: 0,
  },
  {
    id: 'branch',
    label: 'Branch point',
    detail: 'Choose admin or member path',
    icon: GitBranch,
    x: '52%',
    y: '4%',
    delay: 0.15,
  },
  {
    id: 'tour',
    label: 'Product tour',
    detail: '3 features · 5 demos',
    icon: Layers3,
    x: '58%',
    y: '52%',
    delay: 0.3,
  },
  {
    id: 'live',
    label: 'Recording',
    detail: 'Step 4 of 12',
    icon: CircleDot,
    x: '6%',
    y: '58%',
    delay: 0.45,
  },
];

export const HeroWorkflowVisual = () => (
  <div
    className="relative mx-auto aspect-[4/3] w-full max-w-xl overflow-hidden rounded-3xl border border-white/15 bg-slate-900/60 p-4 shadow-2xl shadow-black/40 backdrop-blur-md sm:p-6"
    aria-hidden
  >
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(6,182,212,0.15),transparent_50%),radial-gradient(circle_at_70%_80%,rgba(124,58,237,0.2),transparent_45%)]" />

    <div className="relative flex h-full flex-col rounded-2xl border border-white/10 bg-slate-950/80">
      <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
        <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
        <span className="ml-3 text-xs text-slate-400">app.example.com/onboarding</span>
      </div>

      <div className="relative flex-1 p-4">
        <div className="grid h-full grid-cols-3 gap-2">
          {[1, 2, 3].map((col) => (
            <div key={col} className="space-y-2">
              <div className="h-3 w-full rounded bg-white/10" />
              <div className="h-16 rounded-lg bg-white/5 ring-1 ring-white/10" />
              <div className="h-8 rounded bg-white/5" />
              <div className="h-8 w-2/3 rounded bg-white/5" />
            </div>
          ))}
        </div>

        <motion.div
          className="absolute left-[38%] top-[42%] h-8 w-8 rounded-full border-2 border-brand-cyan bg-brand-cyan/20"
          animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </div>
    </div>

    {CARDS.map((card) => {
      const Icon = card.icon;
      return (
        <motion.div
          key={card.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 + card.delay, duration: 0.5 }}
          style={{ left: card.x, top: card.y }}
          className="absolute w-[42%] max-w-[180px] rounded-xl border border-white/20 bg-white/10 p-3 backdrop-blur-md"
        >
          <div className="flex items-center gap-2">
            <span className="inline-flex rounded-lg bg-peacock-600/30 p-1.5 text-brand-cyan">
              <Icon className="h-3.5 w-3.5" />
            </span>
            <p className="text-xs font-semibold text-white">{card.label}</p>
          </div>
          <p className="mt-1.5 text-[10px] leading-snug text-slate-300">{card.detail}</p>
        </motion.div>
      );
    })}
  </div>
);
