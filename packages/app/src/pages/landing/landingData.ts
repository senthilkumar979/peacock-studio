import type { LucideIcon } from 'lucide-react';
import {
  BookOpen,
  GitBranch,
  Layers3,
  Link2,
  MonitorPlay,
  Puzzle,
  Shield,
  Users2,
  Workflow,
  Columns2,
  Camera,
} from 'lucide-react';

export interface LandingFeature {
  name: string;
  explanation: string;
  benefit: string;
  impact: string;
  icon: LucideIcon;
}

export interface LandingFaq {
  question: string;
  answer: string;
}

export const LANDING_FEATURES: LandingFeature[] = [
  {
    name: 'Chrome extension capture',
    explanation: 'Record clicks, inputs, navigation, and screenshots directly from any website.',
    benefit: 'Turn real product usage into structured steps without manual screenshot work.',
    impact: 'Cut documentation prep time from hours to minutes.',
    icon: Puzzle,
  },
  {
    name: 'Flow editor with branches',
    explanation: 'Reorder steps, add sections, and link branching paths to other saved documents.',
    benefit: 'Handle complex workflows and decision points in one guided experience.',
    impact: 'Replace fragmented Loom + doc + slide decks with one narrative.',
    icon: GitBranch,
  },
  {
    name: 'Persona-led product tours',
    explanation: 'Organize multiple demos into feature chapters anchored to a buyer persona.',
    benefit: 'Each audience sees a focused story instead of a generic product dump.',
    impact: 'Improve demo relevance across sales, onboarding, and enablement.',
    icon: Users2,
  },
  {
    name: 'Interactive player',
    explanation: 'Step-through playback with autoplay, keyboard navigation, and branch selection.',
    benefit: 'Let prospects and users explore at their own pace with clear context.',
    impact: 'Increase comprehension without another live call.',
    icon: MonitorPlay,
  },
  {
    name: 'Share links & PDF export',
    explanation: 'Publish readonly or editable links and export printable guides for docs and tours.',
    benefit: 'Distribute the same polished asset across email, calls, and internal teams.',
    impact: 'Scale your best walkthrough without repeating it live.',
    icon: Link2,
  },
  {
    name: 'Capture editor & compare',
    explanation: 'Polish standalone screenshots with privacy regions, or compare two docs side by side.',
    benefit: 'Ship release notes, before/after guides, and redacted support artifacts quickly.',
    impact: 'Keep documentation accurate as the product evolves.',
    icon: Columns2,
  },
];

export const WORKFLOW_STEPS = [
  {
    step: '01',
    title: 'Install & record',
    description: 'Pin the Peacock Chrome extension and record a real workflow on any site.',
    icon: Puzzle,
  },
  {
    step: '02',
    title: 'Edit & structure',
    description: 'Refine steps, add sections and branches, attach screenshots, and auto-save locally.',
    icon: Workflow,
  },
  {
    step: '03',
    title: 'Tour & share',
    description: 'Bundle demos into persona-led tours, then share links, export PDFs, or present live.',
    icon: Layers3,
  },
];

export const COMPARISON_ROWS = [
  { label: 'Setup time', manual: 'Hours per guide', peacock: 'Minutes from recording' },
  { label: 'Consistency', manual: 'Varies by presenter', peacock: 'Same narrative every time' },
  { label: 'Branching', manual: 'Separate videos or docs', peacock: 'Built-in path selection' },
  { label: 'Persona targeting', manual: 'Custom decks per role', peacock: 'Structured product tours' },
  { label: 'Data control', manual: 'Scattered files & drives', peacock: 'Local-first on device' },
];

export const ARCHITECTURE_POINTS = [
  {
    title: 'Local-first storage',
    copy: 'Documents, tours, and personas persist in IndexedDB on this device — no cloud dependency required.',
    icon: Shield,
  },
  {
    title: 'Shared type system',
    copy: 'Extension and web app share the same event model, coordinates, and step utilities via @peacock/shared.',
    icon: BookOpen,
  },
  {
    title: 'Privacy by design',
    copy: 'Password fields are excluded, sensitive URLs can pause recording, and capture editor supports redaction regions.',
    icon: Shield,
  },
  {
    title: 'Normalized coordinates',
    copy: 'Click markers use 0–1 normalized positions so highlights stay accurate when screenshots resize.',
    icon: Camera,
  },
];

export const LANDING_FAQS: LandingFaq[] = [
  {
    question: 'What is Peacock Studio?',
    answer:
      'Peacock Studio is a browser flow capture and documentation platform. It converts real product usage into editable walkthroughs, shareable demos, and persona-led product tours.',
  },
  {
    question: 'Do I need a backend or account to start?',
    answer:
      'No. The current workflow is local-first. Your library is stored in the browser on this device using IndexedDB.',
  },
  {
    question: 'Can I share guides with my team or customers?',
    answer:
      'Yes. You can copy shareable links (readonly or editable) and export PDFs for documents and product tours. Embed widgets are planned but not yet available.',
  },
  {
    question: 'How do product tours differ from single documents?',
    answer:
      'Product tours combine multiple saved demos into feature chapters, anchored to a persona, with a guided playback flow including presenter mode.',
  },
  {
    question: 'Does Peacock use AI to write my guides?',
    answer:
      'Not today. Step titles and descriptions are generated with deterministic rules from captured element metadata. AI-assisted rewrite is on the roadmap.',
  },
  {
    question: 'Who is this built for?',
    answer:
      'Product marketing, sales engineering, customer success, support, and enablement teams who need repeatable, high-quality product storytelling.',
  },
];

export const AUTOMATION_ITEMS = [
  {
    title: 'Auto step descriptions',
    copy: 'Captured clicks and inputs become readable step titles without manual typing.',
  },
  {
    title: 'Auto-save library',
    copy: 'Documents and tours persist automatically to IndexedDB as you edit.',
  },
  {
    title: 'Sensitive URL guardrails',
    copy: 'Recording can pause on login, payment, and billing URL patterns.',
  },
  {
    title: 'Presenter-ready tours',
    copy: 'Share a clean presenter link that hides chrome and focuses on the story.',
  },
];
