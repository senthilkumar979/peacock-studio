import type { LucideIcon } from 'lucide-react';
import {
  BookOpen,
  CircleDot,
  ClipboardList,
  FileText,
  GitBranch,
  Layers3,
  ListChecks,
  Map,
  MousePointerClick,
  Plus,
  Puzzle,
  Route,
  Share2,
  Sparkles,
  TerminalSquare,
  Users,
  Video,
} from 'lucide-react';
import { FLOW_DOCS_PATH } from '@/constants/routes';
import {
  WORKFLOW_ARTIFACT_TYPES,
  type WorkflowArtifactType,
} from '@/types/workflowArtifact';
import { getExtensionGatePath } from '@/utils/extensionGate';

export const LIBRARY_GUIDE_IDS = {
  flowDocs: 'flow_docs',
  productTours: 'product_tours',
  testCases: 'test_cases',
  playwright: 'playwright_tests',
  flowMap: 'flow_maps',
} as const;

export type LibraryGuideId = (typeof LIBRARY_GUIDE_IDS)[keyof typeof LIBRARY_GUIDE_IDS];

interface LibraryGuideBenefit {
  title: string;
  description: string;
  icon: LucideIcon;
}

interface LibraryGuideStep {
  step: string;
  title: string;
  description: string;
  icon: LucideIcon;
}

export interface LibraryGuideContent {
  icon: LucideIcon;
  headline: string;
  subheadline: string;
  benefits: LibraryGuideBenefit[];
  steps: LibraryGuideStep[];
  stepsSectionTitle: string;
  accent: { gradient: string; surface: string; ring: string };
  cta?: { label: string; href: string };
}

const WORKFLOW_SHARED_STEPS: LibraryGuideStep[] = [
  {
    step: '01',
    title: 'Open a flow document',
    description:
      'Pick any recorded flow from your library, or capture a new one with the Chrome extension.',
    icon: FileText,
  },
  {
    step: '02',
    title: 'Open Workflow deliverables',
    description:
      'In the flow player, open the context panel and switch to the Workflow deliverables tab.',
    icon: Layers3,
  },
];

const LIBRARY_GUIDE_CONTENT: Record<LibraryGuideId, LibraryGuideContent> = {
  [LIBRARY_GUIDE_IDS.flowDocs]: {
    icon: FileText,
    headline: 'Turn browser sessions into step-by-step guides',
    subheadline:
      'Record real product flows with the Chrome extension and Peacock turns every click into polished documentation with screenshots, branches, and share links.',
    stepsSectionTitle: 'How to get started',
    accent: {
      gradient: 'from-peacock-500 to-peacock-700',
      surface: 'from-peacock-50/90 to-blue-50/50',
      ring: 'ring-peacock-100/80',
    },
    cta: {
      label: 'Install extension',
      href: getExtensionGatePath(FLOW_DOCS_PATH),
    },
    benefits: [
      {
        title: 'Screenshots with every step',
        description:
          'Each recorded action captures the UI state automatically — no manual paste or crop work.',
        icon: CircleDot,
      },
      {
        title: 'Branches and sections',
        description:
          'Model decision paths and group steps into sections for complex, real-world workflows.',
        icon: GitBranch,
      },
      {
        title: 'Share and export',
        description:
          'Send a read-only link, export a PDF leave-behind, or embed in your internal wiki.',
        icon: Share2,
      },
      {
        title: 'Guest preview & cloud sync',
        description:
          'Flows can stay on this device while you try Peacock. Sign in to sync across devices and collaborate in a workspace.',
        icon: Puzzle,
      },
    ],
    steps: [
      {
        step: '01',
        title: 'Install the extension',
        description: 'Add Peacock Studio from your browser’s extension store and pin it to your toolbar.',
        icon: Puzzle,
      },
      {
        step: '02',
        title: 'Record a flow',
        description:
          'Navigate any website, click Start Recording, and perform the steps you want to document.',
        icon: CircleDot,
      },
      {
        step: '03',
        title: 'Refine and share',
        description:
          'Stop recording to open the editor. Polish steps, add branches, then share or export.',
        icon: Share2,
      },
    ],
  },
  [LIBRARY_GUIDE_IDS.productTours]: {
    icon: Map,
    headline: 'Build persona-led product education',
    subheadline:
      'Combine multiple demos into structured tours organized by persona and feature — ideal for onboarding, sales, and release storytelling.',
    stepsSectionTitle: 'How to get started',
    accent: {
      gradient: 'from-brand-violet to-peacock-600',
      surface: 'from-violet-50/90 to-peacock-50/50',
      ring: 'ring-violet-100/80',
    },
    cta: {
      label: 'Create your first tour',
      href: getExtensionGatePath('/tours/new'),
    },
    benefits: [
      {
        title: 'Multi-demo narratives',
        description:
          'Chain recorded demos into chapters so viewers follow a coherent story across features.',
        icon: Video,
      },
      {
        title: 'Persona targeting',
        description:
          'Tailor tours for developers, testers, PMs, or customers with persona-specific framing.',
        icon: Users,
      },
      {
        title: 'Feature chapters',
        description:
          'Group related demos under features so tours scale as your product surface grows.',
        icon: BookOpen,
      },
      {
        title: 'Ready for GTM',
        description:
          'Share tours for async onboarding, live calls, or PDF leave-behinds alongside flow docs.',
        icon: Share2,
      },
    ],
    steps: [
      {
        step: '01',
        title: 'Create a tour',
        description: 'Start a new product tour and set the title, persona, and overview.',
        icon: Plus,
      },
      {
        step: '02',
        title: 'Add features and demos',
        description:
          'Create feature chapters and link recorded flow demos to each section of the tour.',
        icon: Layers3,
      },
      {
        step: '03',
        title: 'Share or present',
        description:
          'Preview the tour, refine copy, then share a link or export for your audience.',
        icon: Share2,
      },
    ],
  },
  [LIBRARY_GUIDE_IDS.testCases]: {
    icon: ClipboardList,
    headline: 'Turn recorded flows into QA checklists',
    subheadline:
      'Generate structured test cases from your flow steps — with actions, expected results, and branch coverage — in one click.',
    stepsSectionTitle: 'How to generate',
    accent: {
      gradient: 'from-emerald-500 to-teal-600',
      surface: 'from-emerald-50/90 to-teal-50/50',
      ring: 'ring-emerald-100/80',
    },
    cta: { label: 'Browse flow docs', href: FLOW_DOCS_PATH },
    benefits: [
      {
        title: 'Ready-to-review tables',
        description:
          'Each case includes step numbers, actions, and expected results formatted for QA handoff.',
        icon: ClipboardList,
      },
      {
        title: 'Branches become cases',
        description:
          'Decision paths and alternate routes are split into separate test cases automatically.',
        icon: Route,
      },
      {
        title: 'Section-aware structure',
        description:
          'Cases are grouped by flow sections so testers can focus on one area at a time.',
        icon: ListChecks,
      },
      {
        title: 'Share with your team',
        description:
          'Export Markdown for Jira, TestRail, spreadsheets, or async review in your library.',
        icon: Users,
      },
    ],
    steps: [
      ...WORKFLOW_SHARED_STEPS,
      {
        step: '03',
        title: 'Generate test cases',
        description:
          'Click Generate test cases to produce a Markdown checklist derived from every recorded step.',
        icon: Sparkles,
      },
    ],
  },
  [LIBRARY_GUIDE_IDS.playwright]: {
    icon: TerminalSquare,
    headline: 'Jumpstart Playwright automation',
    subheadline:
      'Get a starter spec with navigation, clicks, and locators pulled from your recorded steps — ready for engineers to extend.',
    stepsSectionTitle: 'How to generate',
    accent: {
      gradient: 'from-violet-500 to-purple-600',
      surface: 'from-violet-50/90 to-purple-50/50',
      ring: 'ring-violet-100/80',
    },
    cta: { label: 'Browse flow docs', href: FLOW_DOCS_PATH },
    benefits: [
      {
        title: 'Runnable starter spec',
        description:
          'A .spec.ts file with page navigation and interaction statements you can run in your test suite.',
        icon: TerminalSquare,
      },
      {
        title: 'Locators from capture',
        description:
          'Selectors are derived from element snapshots recorded during the flow — not guessed from screenshots.',
        icon: MousePointerClick,
      },
      {
        title: 'Aligned with documentation',
        description:
          'Automation follows the same step sequence as your flow doc, so QA and engineering stay in sync.',
        icon: FileText,
      },
      {
        title: 'Extend, don’t rewrite',
        description:
          'Add assertions, fixtures, and CI wiring on top of a scaffold instead of starting from a blank file.',
        icon: Sparkles,
      },
    ],
    steps: [
      ...WORKFLOW_SHARED_STEPS,
      {
        step: '03',
        title: 'Generate Playwright tests',
        description:
          'Click Generate Playwright tests to create a starter spec mapped to your recorded interactions.',
        icon: Sparkles,
      },
    ],
  },
  [LIBRARY_GUIDE_IDS.flowMap]: {
    icon: GitBranch,
    headline: 'Visualize flows at a glance',
    subheadline:
      'Generate a Mermaid flowchart that maps sections, steps, and branches — ideal for reviews, onboarding, and gap analysis.',
    stepsSectionTitle: 'How to generate',
    accent: {
      gradient: 'from-amber-500 to-orange-600',
      surface: 'from-amber-50/90 to-orange-50/50',
      ring: 'ring-amber-100/80',
    },
    cta: { label: 'Browse flow docs', href: FLOW_DOCS_PATH },
    benefits: [
      {
        title: 'Instant flowchart',
        description:
          'A Mermaid diagram that shows how steps connect, including sections and decision branches.',
        icon: Map,
      },
      {
        title: 'Spot missing paths',
        description:
          'See the full topology of a workflow and catch dead ends or undocumented alternate routes.',
        icon: GitBranch,
      },
      {
        title: 'Stakeholder-friendly',
        description:
          'Give PMs, support leads, and new teammates a visual overview without reading every step.',
        icon: Users,
      },
      {
        title: 'Reuse anywhere',
        description:
          'Paste into Notion or Confluence, or export as PNG from the flow map editor.',
        icon: Sparkles,
      },
    ],
    steps: [
      ...WORKFLOW_SHARED_STEPS,
      {
        step: '03',
        title: 'Generate flow map',
        description:
          'Click Generate flow map to build a Mermaid flowchart from your recorded steps and branches.',
        icon: Sparkles,
      },
    ],
  },
};

export function getLibraryGuideContent(guideId: LibraryGuideId): LibraryGuideContent {
  return LIBRARY_GUIDE_CONTENT[guideId];
}

export function getGuideIdForWorkflowArtifact(
  artifactType: WorkflowArtifactType,
): LibraryGuideId {
  switch (artifactType) {
    case WORKFLOW_ARTIFACT_TYPES.testCases:
      return LIBRARY_GUIDE_IDS.testCases;
    case WORKFLOW_ARTIFACT_TYPES.playwright:
      return LIBRARY_GUIDE_IDS.playwright;
    case WORKFLOW_ARTIFACT_TYPES.flowMap:
      return LIBRARY_GUIDE_IDS.flowMap;
    default:
      return LIBRARY_GUIDE_IDS.testCases;
  }
}
