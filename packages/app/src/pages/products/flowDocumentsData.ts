import type { LucideIcon } from 'lucide-react';
import {
  BookOpen,
  CircleDot,
  Columns2,
  GitBranch,
  ImagePlus,
  LayoutList,
  Library,
  MonitorPlay,
  PauseCircle,
  PenLine,
  PlusSquare,
  Sparkles,
} from 'lucide-react';
import type { ProductDetailCapability, ProductDetailCapabilityGroup } from './productCapabilityTypes';
import { getProductDetailCapabilityImage } from './productCapabilityTypes';

export type FlowDocumentCapability = ProductDetailCapability;
export type FlowDocumentCapabilityGroup = ProductDetailCapabilityGroup;

export interface FlowDocumentLifecycleStage {
  step: string;
  title: string;
  description: string;
  capabilityIds: string[];
}

export const FLOW_DOCUMENT_PAGE = {
  eyebrow: 'Product deep dive',
  intro:
    'A feature-by-feature guide to building execution references — from the first recorded click through structured branches, two viewing modes, and your on-device library.',
  heroImageSrc: undefined as string | undefined,
  fitSignals: [
    'You need one authoritative doc per workflow, not a deck that goes stale after the next release',
    'Reviewers should read async in doc view or follow along step-by-step in the player',
    'Complex flows include role variants, recovery paths, or chapters too long for a single scroll',
  ],
  lifecycleHeadline: 'How a flow document comes together',
  lifecycleDescription:
    'Each capability maps to a stage in the lifecycle. Record with guardrails, refine without re-recording, structure for complexity, then publish from the same saved file.',
} as const;

export const FLOW_DOCUMENT_IMAGE_BASE = '/products/flow-documents';

export const getFlowDocumentImageSrc = (fileName: string): string =>
  `${FLOW_DOCUMENT_IMAGE_BASE}/${fileName}`;

export const getFlowDocumentCapabilityImage = (
  capability: FlowDocumentCapability,
): { src: string; publicPath: string } =>
  getProductDetailCapabilityImage(FLOW_DOCUMENT_IMAGE_BASE, capability);

export const FLOW_DOCUMENT_HERO_IMAGE = {
  src: FLOW_DOCUMENT_PAGE.heroImageSrc ?? getFlowDocumentImageSrc('hero.png'),
  publicPath: `${FLOW_DOCUMENT_IMAGE_BASE}/hero.png`,
} as const;

export const FLOW_DOCUMENT_LIFECYCLE: FlowDocumentLifecycleStage[] = [
  {
    step: '01',
    title: 'Record',
    description: 'Capture real interactions in the browser with pause control and session context attached.',
    capabilityIds: ['capturing', 'pausing', 'metadata'],
  },
  {
    step: '02',
    title: 'Refine',
    description: 'Shape step language, fill gaps, and swap screenshots where capture alone is not enough.',
    capabilityIds: ['step-editing', 'manual-step', 'custom-image'],
  },
  {
    step: '03',
    title: 'Structure',
    description: 'Divide long guides into chapters and wire decision points to other saved paths.',
    capabilityIds: ['sectioning', 'branch-paths'],
  },
  {
    step: '04',
    title: 'Deliver',
    description: 'Open the same saved document as scrollable reference, guided playback, or a library entry.',
    capabilityIds: ['doc-view', 'player-view', 'flow-library', 'compare-docs'],
  },
];

export const FLOW_DOCUMENT_CAPABILITY_GROUPS: FlowDocumentCapabilityGroup[] = [
  {
    id: 'record',
    label: 'Record & session context',
    description:
      'What happens in the Chrome extension before you open the editor — including controls that keep captures clean and attributable.',
    icon: CircleDot,
    capabilities: [
      {
        id: 'capturing',
        title: 'Capturing',
        whatItIs:
          'While recording, Peacock listens for clicks, text input, navigation, and page changes. Each event becomes an indexed step with an attached screenshot and auto-generated title derived from element context.',
        benefit:
          'You build the skeleton of a guide by doing the workflow once — no post-hoc screenshot marathon or copy-paste from a screen recording.',
        icon: CircleDot,
      },
      {
        id: 'pausing',
        title: 'Pausing',
        whatItIs:
          'The extension pause control stops event capture mid-session without ending the recording. Resume continues adding steps to the same document at the same outline position.',
        benefit:
          'Handle interruptions, switch tabs for setup, or skip segments you do not want in the guide — without deleting junk steps afterward.',
        icon: PauseCircle,
      },
      {
        id: 'metadata',
        title: 'Metadata',
        whatItIs:
          'At session start and end, Peacock records browser, OS, device category, screen and viewport dimensions, locale, timezone, and recording timestamps. This environment block travels with the document into doc view, player, and PDF export.',
        benefit:
          'Reproduce "works on my machine" issues, attach environment context to audit submissions, and know exactly when and where a guide was captured.',
        icon: Sparkles,
      },
    ],
  },
  {
    id: 'refine',
    label: 'Refine in the editor',
    description:
      'After capture lands in the flow editor, these tools let you correct language and fill gaps without starting a new recording.',
    icon: PenLine,
    capabilities: [
      {
        id: 'step-editing',
        title: 'Editing step title & description',
        whatItIs:
          'Every step exposes inline title and description fields. Auto-generated titles from captured element metadata are a starting point — you rewrite them to match your team\'s vocabulary and add context rules cannot infer.',
        benefit:
          'Turn terse capture labels into support-ready instructions with preconditions, expected results, or internal ticket references.',
        icon: PenLine,
      },
      {
        id: 'manual-step',
        title: 'Adding a manual step',
        whatItIs:
          'Insert an empty step anywhere in the outline from the editor. Manual steps ship with a placeholder screenshot until you upload an image or capture a replacement frame.',
        benefit:
          'Document API-only actions, third-party handoffs, or permission-gated screens that cannot be recorded live — while keeping the full workflow in one file.',
        icon: PlusSquare,
      },
      {
        id: 'custom-image',
        title: 'Uploading a custom image',
        whatItIs:
          'Replace or supplement any step\'s auto-captured screenshot by uploading an image from your machine. Accepted formats follow the step image upload rules in the editor panel.',
        benefit:
          'Fix a blurry frame, show an ideal end state, or illustrate a screen the recorder could not reach during the session.',
        icon: ImagePlus,
      },
    ],
  },
  {
    id: 'structure',
    label: 'Structure complex guides',
    description:
      'When a workflow outgrows a flat step list, these outline tools add navigation and decision logic without splitting into separate files.',
    icon: LayoutList,
    capabilities: [
      {
        id: 'sectioning',
        title: 'Sectioning',
        whatItIs:
          'Section dividers in the outline carry a title and description. They group steps into chapters visible in the document outline, as chapter cards in the player, and as logical breaks in PDF export.',
        benefit:
          'Keep multi-phase SOPs, release checklists, and onboarding sequences readable — reviewers jump to the chapter they need instead of scrolling fifty steps.',
        icon: LayoutList,
      },
      {
        id: 'branch-paths',
        title: 'Branch point & paths',
        whatItIs:
          'A branch point presents a decision with labeled paths. Each path references a step range from the current document or another saved flow document. At playback, viewers choose a path and follow its linked steps.',
        benefit:
          'Model admin vs member flows, error recovery, or regional variants in one guide — paths stay linked to authoritative docs instead of forked copies.',
        icon: GitBranch,
      },
    ],
  },
  {
    id: 'deliver',
    label: 'Views, library & compare',
    description:
      'Open saved flow documents in multiple modes, manage your catalog, and review two versions side by side when releases change the workflow.',
    icon: Library,
    capabilities: [
      {
        id: 'doc-view',
        title: 'Doc view',
        whatItIs:
          'A scrollable long-form layout with a sticky outline sidebar, section headers, inline screenshots, and capture metadata. Active section tracking follows scroll position for quick navigation.',
        benefit:
          'Best for async review, copying step text into tickets, and auditors who need the full sequence visible at once.',
        icon: BookOpen,
      },
      {
        id: 'player-view',
        title: 'Player view',
        whatItIs:
          'Focused step-by-step playback with screenshot highlights, keyboard navigation, autoplay, and branch choice panels at decision points. One step fills the viewport at a time.',
        benefit:
          'Best for live handoffs, training walkthroughs, and validation sessions where the viewer should concentrate on a single action before advancing.',
        icon: MonitorPlay,
      },
      {
        id: 'flow-library',
        title: 'Flow docs library',
        whatItIs:
          'Saved flow documents appear in the dashboard library with title, optional version label, step count, and created date. Open directly into the editor, doc view, or player — or link paths from branch points.',
        benefit:
          'Your execution references stay organized on device: search by title, reopen for edits, and reuse step ranges across branch paths without duplicating recordings.',
        icon: Library,
      },
      {
        id: 'compare-docs',
        title: 'Compare Docs',
        whatItIs:
          'Pick any two saved flow documents from your library and open them in a split compare workspace. Both panes stay locked to the same step index as you move forward or back — so step 4 on the left always lines up with step 4 on the right, with screenshots and titles visible together. Pair an older capture with a re-recorded version after a release to see what shifted in the UI or flow.',
        benefit:
          'Product owners and business analysts can demo improvements to customers or internal users without rebuilding decks — walk through before-and-after screens in sync and call out exactly what changed in the new implementation.',
        icon: Columns2,
      },
    ],
  },
];

export const getFlowDocumentCapability = (id: string): FlowDocumentCapability | undefined => {
  for (const group of FLOW_DOCUMENT_CAPABILITY_GROUPS) {
    const match = group.capabilities.find((capability) => capability.id === id);
    if (match) return match;
  }
  return undefined;
};
