import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { GitBranch, Map, MonitorPlay } from 'lucide-react';
import { LandingSectionShell } from './LandingSectionShell';

interface PreviewCardProps {
  label: string;
  icon: typeof MonitorPlay;
  accentClass: string;
  children: ReactNode;
}

const PreviewCard = ({ label, icon: Icon, accentClass, children }: PreviewCardProps) => (
  <motion.article
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.35 }}
    className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg shadow-slate-200/50"
  >
    <div className={accentClass} />
    <div className="flex items-center gap-2 border-b border-slate-100 px-4 py-3">
      <Icon className="h-4 w-4 text-peacock-700" aria-hidden />
      <p className="text-sm font-semibold text-slate-900">{label}</p>
    </div>
    {children}
  </motion.article>
);

export const PreviewSection = () => (
  <LandingSectionShell
    tone="light"
    eyebrow="Product preview"
    title="See the actual surfaces your team will use"
    description="Editor, tour builder, and player — styled to match the live application."
  >
    <div className="grid gap-6 lg:grid-cols-3">
      <PreviewCard
        label="Flow editor"
        icon={MonitorPlay}
        accentClass="h-1 bg-gradient-to-r from-peacock-500 to-peacock-700"
      >
        <div className="space-y-2 p-4">
          {['Sign in to dashboard', 'Open settings panel', 'Configure workspace'].map((step, i) => (
            <div
              key={step}
              className={
                i === 1
                  ? 'flex items-center gap-3 rounded-lg border border-peacock-300 bg-peacock-50 px-3 py-2 text-xs text-peacock-800'
                  : 'flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600'
              }
            >
              <span className="font-mono text-[10px] text-slate-400">{i + 1}</span>
              {step}
            </div>
          ))}
          <div className="mt-2 flex items-center gap-2 rounded-lg border border-brand-violet/30 bg-brand-violet/5 px-3 py-2 text-xs text-brand-violet">
            <GitBranch className="h-3.5 w-3.5" aria-hidden />
            Branch: Admin vs Member setup
          </div>
        </div>
      </PreviewCard>

      <PreviewCard
        label="Product tour builder"
        icon={Map}
        accentClass="h-1 bg-gradient-to-r from-brand-violet to-peacock-600"
      >
        <div className="p-4">
          <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-peacock-50 to-brand-violet/5 p-4">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-peacock-700">Persona</p>
            <p className="mt-1 text-sm font-semibold text-slate-900">Revenue Operations Lead</p>
            <p className="mt-3 text-[10px] font-semibold uppercase tracking-wide text-slate-500">Features</p>
            <div className="mt-2 space-y-1.5">
              {['Pipeline setup', 'Reporting & analytics', 'Team permissions'].map((feature) => (
                <div
                  key={feature}
                  className="rounded-md bg-white px-2 py-1.5 text-xs text-slate-700 ring-1 ring-slate-200"
                >
                  {feature}
                </div>
              ))}
            </div>
          </div>
        </div>
      </PreviewCard>

      <PreviewCard
        label="Interactive player"
        icon={MonitorPlay}
        accentClass="h-1 bg-gradient-to-r from-brand-cyan to-peacock-600"
      >
        <div className="p-4">
          <div className="aspect-video rounded-lg bg-slate-100 ring-1 ring-slate-200">
            <div className="flex h-full flex-col justify-between p-3">
              <div className="flex gap-1">
                <span className="h-1.5 flex-1 rounded-full bg-peacock-500" />
                <span className="h-1.5 flex-1 rounded-full bg-slate-200" />
                <span className="h-1.5 flex-1 rounded-full bg-slate-200" />
              </div>
              <div className="rounded-lg bg-white/90 p-2 text-[10px] text-slate-700 shadow-sm">
                Step 2: Click <strong>Settings</strong> in the sidebar
              </div>
            </div>
          </div>
        </div>
      </PreviewCard>
    </div>
  </LandingSectionShell>
);
