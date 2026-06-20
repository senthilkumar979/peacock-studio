import { motion } from 'framer-motion';
import { Map, MonitorPlay, PenLine } from 'lucide-react';
import { Link } from 'react-router-dom';
import { LandingSectionShell } from './LandingSectionShell';
import { PreviewCard } from './PreviewCard';
import {
  FlowEditorPreviewMock,
  PlayerPreviewMock,
  TourBuilderPreviewMock,
} from './PreviewSectionMocks';

const PREVIEW_SURFACES = ['Flow editor', 'Tour builder', 'Interactive player'] as const;

export const PreviewSection = () => (
  <LandingSectionShell
    id="preview"
    tone="light"
    eyebrow="Product preview"
    title="See the actual surfaces your team will use"
    description="Editor, tour builder, and player — styled to match the live application."
  >
    <div className="mb-8 flex flex-wrap gap-3">
      {PREVIEW_SURFACES.map((surface) => (
        <span
          key={surface}
          className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm"
        >
          {surface}
        </span>
      ))}
    </div>

    <div className="grid gap-6 lg:grid-cols-3">
      <PreviewCard
        label="Flow editor"
        caption="Three-column editor with outline, canvas preview, and step or section detail panels."
        icon={PenLine}
        accentClass="h-1 bg-gradient-to-r from-peacock-500 to-peacock-700"
        index={0}
      >
        <FlowEditorPreviewMock />
      </PreviewCard>

      <PreviewCard
        label="Product tour builder"
        caption="Persona-led chapters that bundle multiple saved demos into one guided narrative."
        icon={Map}
        accentClass="h-1 bg-gradient-to-r from-brand-violet to-peacock-600"
        index={1}
      >
        <TourBuilderPreviewMock />
      </PreviewCard>

      <PreviewCard
        label="Interactive player"
        caption="Guided step-through with progress, keyboard navigation, and branch selection."
        icon={MonitorPlay}
        accentClass="h-1 bg-gradient-to-r from-brand-cyan to-peacock-600"
        index={2}
      >
        <PlayerPreviewMock />
      </PreviewCard>
    </div>

    <motion.p
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      className="mt-8 text-center text-sm text-slate-500"
    >
      Same surfaces inside the app —{' '}
      <Link to="/editor" className="font-semibold text-peacock-700 hover:text-peacock-900">
        open the editor
      </Link>{' '}
      or{' '}
      <Link to="/tours/new" className="font-semibold text-peacock-700 hover:text-peacock-900">
        start a product tour
      </Link>
      .
    </motion.p>
  </LandingSectionShell>
);
