import type { CaptureBackgroundPreset } from '../types/capture';

export const CAPTURE_BACKGROUND_PRESETS: CaptureBackgroundPreset[] = [
  // { id: 'white', label: 'White', kind: 'solid', solidColor: '#ffffff' },
  // { id: 'slate', label: 'Slate', kind: 'solid', solidColor: '#f1f5f9' },
  { id: 'charcoal', label: 'Charcoal', kind: 'solid', solidColor: '#1e293b', imageShadow: true },
  {
    id: 'peacock-soft',
    label: 'Peacock soft',
    kind: 'linear-gradient',
    gradientAngle: 145,
    gradientStops: [
      { offset: 0, color: '#eff6ff' },
      { offset: 0.55, color: '#f8fafc' },
      { offset: 1, color: '#ede9fe' },
    ],
    imageShadow: true,
  },
  {
    id: 'peacock-bold',
    label: 'Peacock bold',
    kind: 'linear-gradient',
    gradientAngle: 135,
    gradientStops: [
      { offset: 0, color: '#2563eb' },
      { offset: 0.5, color: '#4f46e5' },
      { offset: 1, color: '#7c3aed' },
    ],
    imageShadow: true,
  },
  {
    id: 'ocean',
    label: 'Ocean',
    kind: 'linear-gradient',
    gradientAngle: 160,
    gradientStops: [
      { offset: 0, color: '#0ea5e9' },
      { offset: 0.5, color: '#2563eb' },
      { offset: 1, color: '#1e3a8a' },
    ],
    imageShadow: true,
  },
  {
    id: 'aurora',
    label: 'Aurora',
    kind: 'linear-gradient',
    gradientAngle: 120,
    gradientStops: [
      { offset: 0, color: '#22d3ee' },
      { offset: 0.45, color: '#6366f1' },
      { offset: 1, color: '#a855f7' },
    ],
    imageShadow: true,
  },
  {
    id: 'sunrise',
    label: 'Sunrise',
    kind: 'linear-gradient',
    gradientAngle: 120,
    gradientStops: [
      { offset: 0, color: '#fef3c7' },
      { offset: 0.5, color: '#fce7f3' },
      { offset: 1, color: '#dbeafe' },
    ],
    imageShadow: true,
  },
  {
    id: 'citrus',
    label: 'Citrus',
    kind: 'linear-gradient',
    gradientAngle: 135,
    gradientStops: [
      { offset: 0, color: '#fef08a' },
      { offset: 0.5, color: '#fdba74' },
      { offset: 1, color: '#f472b6' },
    ],
    imageShadow: true,
  },
  {
    id: 'forest',
    label: 'Forest',
    kind: 'linear-gradient',
    gradientAngle: 145,
    gradientStops: [
      { offset: 0, color: '#064e3b' },
      { offset: 0.5, color: '#059669' },
      { offset: 1, color: '#a7f3d0' },
    ],
    imageShadow: true,
  },
  {
    id: 'ember',
    label: 'Ember',
    kind: 'linear-gradient',
    gradientAngle: 135,
    gradientStops: [
      { offset: 0, color: '#7f1d1d' },
      { offset: 0.5, color: '#ea580c' },
      { offset: 1, color: '#fde047' },
    ],
    imageShadow: true,
  },
  {
    id: 'midnight',
    label: 'Midnight',
    kind: 'linear-gradient',
    gradientAngle: 160,
    gradientStops: [
      { offset: 0, color: '#0f172a' },
      { offset: 0.5, color: '#312e81' },
      { offset: 1, color: '#581c87' },
    ],
    imageShadow: true,
  },
  {
    id: 'studio-dark',
    label: 'Studio dark',
    kind: 'linear-gradient',
    gradientAngle: 160,
    gradientStops: [
      { offset: 0, color: '#0f172a' },
      { offset: 1, color: '#1e293b' },
    ],
    imageShadow: true,
  },
  {
    id: 'silver',
    label: 'Silver',
    kind: 'linear-gradient',
    gradientAngle: 180,
    gradientStops: [
      { offset: 0, color: '#f8fafc' },
      { offset: 0.5, color: '#cbd5e1' },
      { offset: 1, color: '#94a3b8' },
    ],
    imageShadow: true,
  },
  {
    id: 'rose-gold',
    label: 'Rose gold',
    kind: 'linear-gradient',
    gradientAngle: 135,
    gradientStops: [
      { offset: 0, color: '#fff1f2' },
      { offset: 0.45, color: '#fda4af' },
      { offset: 1, color: '#fcd34d' },
    ],
    imageShadow: true,
  },
  {
    id: 'mesh-blue',
    label: 'Mesh blue',
    kind: 'linear-gradient',
    gradientAngle: 45,
    gradientStops: [
      { offset: 0, color: '#dbeafe' },
      { offset: 0.35, color: '#e0e7ff' },
      { offset: 0.7, color: '#ede9fe' },
      { offset: 1, color: '#cffafe' },
    ],
    imageShadow: true,
  },
  {
    id: 'mesh-warm',
    label: 'Mesh warm',
    kind: 'linear-gradient',
    gradientAngle: 200,
    gradientStops: [
      { offset: 0, color: '#ffedd5' },
      { offset: 0.4, color: '#fce7f3' },
      { offset: 0.75, color: '#e0f2fe' },
      { offset: 1, color: '#fef9c3' },
    ],
    imageShadow: true,
  },
];

export function getCaptureBackgroundPreset(id: string): CaptureBackgroundPreset | null {
  return CAPTURE_BACKGROUND_PRESETS.find((preset) => preset.id === id) ?? null;
}

export function getPresetSwatchCss(preset: CaptureBackgroundPreset): string {
  if (preset.kind === 'solid' && preset.solidColor) return preset.solidColor;
  const stops = (preset.gradientStops ?? [])
    .map((stop) => `${stop.color} ${stop.offset * 100}%`)
    .join(', ');
  return `linear-gradient(${preset.gradientAngle ?? 135}deg, ${stops})`;
}
