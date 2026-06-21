import type { LucideIcon } from 'lucide-react';
import {
  Camera,
  ClipboardCopy,
  Crop,
  Download,
  EyeOff,
  FolderOpen,
  ImageIcon,
  Paintbrush,
  Scan,
  ScanEye,
  Sparkles,
  Type,
} from 'lucide-react';
import { CAPTURE_BACKGROUND_PRESETS } from '@peacock/shared';
import type { ProductDetailCapabilityGroup } from './productCapabilityTypes';

export const CAPTURE_EDITOR_PAGE = {
  eyebrow: 'Product deep dive',
  intro:
    'Manual screenshots pile up on your desktop, need cropping in another app, and rarely ship with context. Capture & Editor captures from the browser, opens a preview with instant share options, and optionally frames the shot with captions, gradients, and privacy tools — then sends the result straight to clipboard or download.',
  fitSignals: [
    'You paste screenshots into Teams, Slack, email, or Confluence and want one polished image — not five files on your desktop',
    'You need titles, gradient backgrounds, or redaction without opening Photoshop or PowerPoint',
    'You do not want Peacock to become another folder of orphaned PNGs — share and move on',
  ],
  backgroundPresetCount: CAPTURE_BACKGROUND_PRESETS.length,
} as const;

export const CAPTURE_EDITOR_IMAGE_BASE = '/products/capture-screenshot-editor';

export const getCaptureEditorImageSrc = (fileName: string): string =>
  `${CAPTURE_EDITOR_IMAGE_BASE}/${fileName}`;

export const CAPTURE_EDITOR_HERO_IMAGE = {
  src: getCaptureEditorImageSrc('hero.png'),
  publicPath: `${CAPTURE_EDITOR_IMAGE_BASE}/hero.png`,
} as const;

export interface CaptureEditorPainPoint {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
}

export const MANUAL_SCREENSHOT_PAIN_POINTS: CaptureEditorPainPoint[] = [
  {
    id: 'clutter',
    title: 'Screenshot clutter everywhere',
    description:
      'Manual captures land on your desktop or Downloads with names like Screenshot 2026-03-19. Finding the right file, deleting duplicates, and attaching the latest version to a chat becomes its own chore.',
    icon: FolderOpen,
  },
  {
    id: 'cleanup',
    title: 'Cleanup in another tool',
    description:
      'Crop in Preview, blur sensitive fields in an image editor, add a caption in PowerPoint — every screenshot becomes a mini project before you can paste it into Teams or Confluence.',
    icon: Paintbrush,
  },
  {
    id: 'context',
    title: 'No built-in context',
    description:
      'Raw PNGs do not explain what the viewer is looking at. You end up typing explanations in the chat thread because the image alone is not enough.',
    icon: Type,
  },
];

export const CAPTURE_EDITOR_CAPABILITY_GROUPS: ProductDetailCapabilityGroup[] = [
  {
    id: 'capture',
    label: 'Capture from the extension',
    description:
      'Grab the screen from the Chrome extension popup — Peacock opens a preview page with your capture ready to share or edit.',
    icon: Camera,
    capabilities: [
      {
        id: 'capture-modes',
        title: 'Three capture modes',
        whatItIs:
          'From the extension popup, capture the visible viewport, drag a selection region, or stitch a full scrollable page. Each mode opens a dedicated preview tab with the raw screenshot — no saving to your desktop first.',
        benefit:
          'Start from the exact frame you need without a separate snipping tool or manual scroll-and-stitch workflow.',
        icon: Scan,
      },
      {
        id: 'preview-actions',
        title: 'Preview: Edit, Download & Copy',
        whatItIs:
          'After capture, a preview page shows the screenshot immediately with three actions: open the editor, download the original PNG, or copy the original image to your clipboard.',
        benefit:
          'Share unedited captures in seconds — or jump into the editor when the shot needs polish.',
        icon: ImageIcon,
      },
      {
        id: 'copy-unedited',
        title: 'Copy to clipboard (no local file)',
        whatItIs:
          'Copy places the PNG on the system clipboard via the browser Clipboard API. Paste directly into Microsoft Teams, Slack, Outlook, Gmail, Confluence, Word, or any app that accepts images — without writing a file to disk.',
        benefit:
          'Skip the Downloads folder entirely when a quick paste into chat or a wiki page is all you need.',
        icon: ClipboardCopy,
      },
    ],
  },
  {
    id: 'editor',
    label: 'Edit in Capture Studio',
    description:
      'Edit opens the Peacock app in a dedicated capture editor — frame the screenshot, add context, and protect sensitive areas before export.',
    icon: Paintbrush,
    capabilities: [
      {
        id: 'title-description',
        title: 'Title & description (image caption)',
        whatItIs:
          'Add a title and short description rendered above the screenshot in the exported composite — like a caption block for support articles, release notes, or internal walkthroughs.',
        benefit:
          'Viewers understand what they are looking at without reading the surrounding chat or doc first.',
        icon: Type,
      },
      {
        id: 'backgrounds',
        title: 'Gradient backgrounds',
        whatItIs: `Choose from ${CAPTURE_EDITOR_PAGE.backgroundPresetCount} built-in background presets — soft mesh gradients, bold brand tones, charcoal studio frames, and more. Padding and corner radius controls shape how the screenshot sits on the canvas.`,
        benefit:
          'Ship presentation-ready images that match your brand instead of raw browser chrome on white.',
        icon: Sparkles,
      },
      {
        id: 'crop',
        title: 'Crop',
        whatItIs:
          'Draw a crop region on the canvas to focus on the part of the screenshot that matters. The crop applies to the exported image and respects normalized coordinates so exports stay accurate.',
        benefit:
          'Remove dead space and browser noise without re-capturing or switching to another editor.',
        icon: Crop,
      },
      {
        id: 'redact',
        title: 'Redact',
        whatItIs:
          'Draw redact regions over areas that must be hidden completely. Redaction fills the region with an opaque white overlay in the final export — content underneath is not visible.',
        benefit:
          'Share screenshots externally when names, account numbers, or internal URLs must disappear entirely.',
        icon: EyeOff,
      },
      {
        id: 'blur',
        title: 'Blur',
        whatItIs:
          'Draw blur regions to soften sensitive or distracting areas while keeping layout context visible. Blur intensity is adjustable per region.',
        benefit:
          'Mask tokens, emails, or secondary UI chrome without a solid box that breaks the visual flow.',
        icon: ScanEye,
      },
    ],
  },
  {
    id: 'export',
    label: 'Export & go',
    description:
      'When editing is done, export the composite — Peacock does not add the image to a library inside the app.',
    icon: Download,
    capabilities: [
      {
        id: 'export-edited',
        title: 'Copy or download the edited image',
        whatItIs:
          'The editor renders title, description, background, crop, and privacy regions into a single PNG. Copy edited puts that composite on the clipboard; Download edited saves one file with a timestamped name.',
        benefit:
          'One polished asset ready for Teams, Slack, email, Confluence, or slide decks — with all edits baked in.',
        icon: Download,
      },
    ],
  },
];

export const CAPTURE_EDITOR_WORKFLOW = [
  { step: '01', title: 'Capture', description: 'Extension popup → visible, selection, or full page' },
  { step: '02', title: 'Preview', description: 'Edit, Download, or Copy to clipboard' },
  { step: '03', title: 'Polish', description: 'Optional editor: caption, background, crop, redact, blur' },
  { step: '04', title: 'Share', description: 'Copy or download — paste into Teams, Slack, Confluence, email' },
] as const;
