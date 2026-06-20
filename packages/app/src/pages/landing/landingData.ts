import type { LucideIcon } from 'lucide-react';
import {
  BookOpen,
  GitBranch,
  Layers3,
  LayoutList,
  Link2,
  FileText,
  AppWindow,
  MonitorPlay,
  Puzzle,
  Shield,
  Users2,
  Workflow,
  Columns2,
  Camera,
  Paintbrush,
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

export const LANDING_CATEGORY = {
  headline: 'The system of record for how work actually happens.',
  description:
    'Peacock transforms real workflows into reusable execution guides and narrative experiences, helping teams align faster, enable others consistently, and preserve operational knowledge as products evolve.',
} as const;

export const LANDING_TWO_FORMATS = [
  {
    title: 'Flow Documents',
    subtitle: 'Execution references',
    copy: 'Step-by-step guides with screenshots, branches, and share links — how teams run QA, support, and internal processes.',
  },
  {
    title: 'Product Tours',
    subtitle: 'Adoption narratives',
    copy: 'Multiple demos composed into guided journeys for onboarding, sales, releases, and executive storytelling.',
  },
] as const;

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
    explanation: 'Reorder steps and link branching paths to other saved documents.',
    benefit: 'Handle complex workflows and decision points in one guided experience.',
    impact: 'Replace fragmented docs, recordings, and slide decks with one narrative.',
    icon: GitBranch,
  },
  {
    name: 'Sectioning in flow doc',
    explanation:
      'Add chapter dividers with title and description to split long guides into navigable sections in the outline.',
    benefit: 'Organize phased onboarding, release chapters, and multi-part SOPs without separate documents.',
    impact: 'Keep long flows readable in document view, player chapter cards, and PDF exports.',
    icon: LayoutList,
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
    name: 'Document view or Player View',
    explanation: 'Same saved flow opens as scrollable documentation or guided step-through playback.',
    benefit: 'One asset for reference reading and live or self-serve walkthroughs.',
    impact: 'Support async review and guided demos without duplicating content.',
    icon: BookOpen,
  },
  {
    name: 'Share link',
    explanation:
      'Copy readonly or editable URLs for flow documents and product tours — with optional branch path filters on readonly shares.',
    benefit: 'Distribute the same guide to teammates, customers, or auditors without re-recording.',
    impact: 'Scale walkthroughs across email, chat, and internal wikis from one source.',
    icon: Link2,
  },
  {
    name: 'Embed player',
    explanation:
      'Share guided player links for step-through playback; embeddable widgets for docs and tours are on the roadmap.',
    benefit: 'Let viewers explore flows interactively instead of scrolling static screenshots alone.',
    impact: 'Improve comprehension with the same player experience you use on live calls.',
    icon: AppWindow,
  },
  {
    name: 'Export to PDF',
    explanation:
      'Export flow documents and product tours as multi-page PDFs with cover, steps, branches, and session metadata.',
    benefit: 'Attach printable leave-behinds to emails, QBR packs, audit submissions, and release notes.',
    impact: 'Reach audiences who need offline or archivable documentation formats.',
    icon: FileText,
  },
  {
    name: 'Capture screenshot',
    explanation:
      'Grab screenshots from the extension popup — visible region, selected region, or the entire scrollable page.',
    benefit: 'Capture exactly what you need without leaving the browser or stitching images manually.',
    impact: 'Start support, marketing, and doc assets from real product screens in seconds.',
    icon: Camera,
  },
  {
    name: 'Edit captured screenshot',
    explanation:
      'Open captures in the editor to add gradient backgrounds, crop, blur, redact, and title or description context.',
    benefit: 'Polish privacy-safe, on-brand images ready for guides, help articles, and leave-behinds.',
    impact: 'Publish professional screenshots without a separate design workflow.',
    icon: Paintbrush,
  },
  {
    name: 'Compare flow docs',
    explanation: 'Review two saved documents side by side, stepping through aligned indices in sync.',
    benefit: 'Validate UI changes and release diffs with a structured before-and-after view.',
    impact: 'Catch workflow drift after updates without manual screenshot comparison.',
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
  { label: 'Screenshot sync', manual: 'Manual paste & crop', peacock: 'Captured with each action' },
  { label: 'Release review', manual: 'Side-by-side guesswork', peacock: 'Compare Docs by step index' },
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
  {
    question: 'What should I know about current limitations?',
    answer:
      'Peacock is local-first today — no cloud sync or team workspace yet. Share links are URL-based, embed widgets are planned but not shipped, and Compare Docs aligns steps by index rather than semantic diff. Peacock excels at structured capture, editing, and privacy on device; cloud collaboration is the natural next chapter.',
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
  {
    title: 'Capture environment metadata',
    copy: 'Browser, OS, and session context recorded once per capture for audit-friendly exports.',
  },
  {
    title: 'Version labels',
    copy: 'Tag documents by release so your library and PDFs stay searchable across iterations.',
  },
];
