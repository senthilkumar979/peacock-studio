import type { LucideIcon } from 'lucide-react';
import {
  Bug,
  FileWarning,
  GraduationCap,
  Headphones,
  HeartHandshake,
  Layers3,
  Presentation,
  Route,
  UserCircle2,
  Users2,
  Workflow,
} from 'lucide-react';

export interface ProductTourGap {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
}

export interface ProductTourAdvantage {
  id: string;
  title: string;
  whatItIs: string;
  benefit: string;
  icon: LucideIcon;
}

export interface ProductTourExampleFeature {
  title: string;
  demos: string[];
}

export interface ProductTourAudience {
  id: string;
  role: string;
  title: string;
  description: string;
  icon: LucideIcon;
}

export const PRODUCT_TOUR_PAGE = {
  eyebrow: 'Product deep dive',
  intro:
    'Traditional documentation tools were built for static pages — not for products with many features, branching scenarios, and audiences who need to see the workflow in motion. Product Tours turn captured demos into persona-led narratives your whole company can reuse.',
  fitSignals: [
    'Your product has multiple features, each with several real-world scenarios to show',
    'Sales, support, and onboarding all need different stories — not one generic wiki page',
    'Word, Confluence, and SharePoint cannot play back a workflow or bundle scenarios into a guided journey',
  ],
} as const;

export const PRODUCT_TOUR_IMAGE_BASE = '/products/product-tours';

export const getProductTourImageSrc = (fileName: string): string =>
  `${PRODUCT_TOUR_IMAGE_BASE}/${fileName}`;

export const PRODUCT_TOUR_HERO_IMAGE = {
  src: getProductTourImageSrc('hero.png'),
  publicPath: `${PRODUCT_TOUR_IMAGE_BASE}/hero.png`,
} as const;

export const TRADITIONAL_DOC_GAPS: ProductTourGap[] = [
  {
    id: 'static-snapshots',
    title: 'Static snapshots, not live workflows',
    description:
      'Confluence, SharePoint, and Word store screenshots and prose. Viewers read about the product — they do not step through it. Multi-step flows become long pages that are hard to follow and impossible to present live without a separate deck or screen share.',
    icon: FileWarning,
  },
  {
    id: 'one-size-fits-all',
    title: 'One document for every audience',
    description:
      'A single wiki article tries to serve product owners, sales, support, new hires, testers, and executives at once. Each group cares about different features and scenarios, but traditional tools offer no persona layer — only more pages or more folders.',
    icon: Users2,
  },
  {
    id: 'scenario-sprawl',
    title: 'Scenarios scattered across files',
    description:
      'Happy path in one doc, rejection flow in another, upgrade request in a third. Nothing connects "application submitted" to "approval status" to "card upgrade" as one coherent product story — reviewers hunt through links and outdated attachments.',
    icon: Layers3,
  },
  {
    id: 'decay-on-release',
    title: 'Decay after every release',
    description:
      'When the UI changes, Word and wiki pages need manual re-screenshotting and rewriting. There is no link back to a recorded workflow, so documentation drifts from what the product actually does.',
    icon: Workflow,
  },
];

export const PRODUCT_TOUR_ADVANTAGES: ProductTourAdvantage[] = [
  {
    id: 'composed-narrative',
    title: 'A tour, not a pile of pages',
    whatItIs:
      'A Product Tour bundles saved flow documents into feature chapters. Each demo is a captured workflow with real steps and screenshots — composed into one guided journey instead of scattered wiki articles.',
    benefit:
      'One URL tells the whole product story: features group related capabilities, demos cover the scenarios inside each feature.',
    icon: Route,
  },
  {
    id: 'guided-playback',
    title: 'Playback, not just reading',
    whatItIs:
      'The tour learner walks viewers through persona intro, feature chapters, and demo playback with keyboard navigation — the same step-through experience you use on live calls.',
    benefit:
      'Stakeholders see the product in motion. You demo improvements without rebuilding PowerPoint or scheduling another screen share.',
    icon: Presentation,
  },
  {
    id: 'reuse-captures',
    title: 'Build once from real captures',
    whatItIs:
      'Each demo links to a flow document recorded in the browser. Update the underlying capture, and the tour reflects the current product — no re-pasting images into Word or Confluence.',
    benefit:
      'Product, support, and QA share one source of truth for how a scenario actually works.',
    icon: Layers3,
  },
];

export const CREDIT_CARD_TOUR_EXAMPLE = {
  tourTitle: 'Applying for a credit card',
  tourDescription:
    'One product tour can span the full lifecycle — grouped into features, each feature holding multiple demos for different scenarios.',
  features: [
    {
      title: 'Feature 1: Application',
      demos: ['Application form submission', 'Uploading necessary documents'],
    },
    {
      title: 'Feature 2: Card approval status',
      demos: ['Verification & application approval', 'Application rejection'],
    },
    {
      title: 'Feature 3: Card upgrade',
      demos: [
        'Card upgrade request',
        'Card limit upgrade request',
        'Card limit approval',
        'Card upgrade approval',
      ],
    },
  ] satisfies ProductTourExampleFeature[],
};

export const PERSONA_TOUR_BENEFITS = {
  headline: 'Why persona-based tours matter',
  description:
    'Each tour anchors to a persona — a buyer, an applicant, a support agent, or an internal operator. The same product can have multiple tours with different feature emphasis, without duplicating captures or maintaining parallel wiki spaces.',
  points: [
    {
      title: 'Focused stories per audience',
      description:
        'A retail applicant tour highlights application and approval. A support-agent tour emphasizes status lookup and rejection handling. Same demos in the library, different narrative order and framing.',
    },
    {
      title: 'Less noise for every viewer',
      description:
        'Personas filter what matters. Sales sees adoption value; helpdesk sees troubleshooting paths — not every feature crammed into one Confluence tree.',
    },
    {
      title: 'Scalable across GTM and ops',
      description:
        'Companies ship persona-led tours for prospects, customers, and internal teams without authoring separate Word packs for each group.',
    },
  ],
  image: {
    src: getProductTourImageSrc('persona-tours.png'),
    publicPath: `${PRODUCT_TOUR_IMAGE_BASE}/persona-tours.png`,
  },
} as const;

export const PRODUCT_TOUR_AUDIENCES: ProductTourAudience[] = [
  {
    id: 'new-hires',
    role: 'New hires',
    title: 'Quicker knowledge transfer',
    description:
      'Onboard into applications and products faster with guided tours that show real workflows — not walls of wiki text to read on day one.',
    icon: GraduationCap,
  },
  {
    id: 'po-ba',
    role: 'Product owners & business analysts',
    title: 'Demo to internal and external users',
    description:
      'Walk stakeholders through new improvements release-by-release. Show what changed and why it matters with composed demos instead of one-off slide decks.',
    icon: UserCircle2,
  },
  {
    id: 'sales',
    role: 'Sales',
    title: 'Customer-ready demos',
    description:
      'Share persona-led tours that highlight the scenarios buyers care about — application flows, approvals, upgrades — in a presenter-ready playback experience.',
    icon: Presentation,
  },
  {
    id: 'support',
    role: 'Service & helpdesk',
    title: 'Support customers on live issues',
    description:
      'Follow the same captured paths customers take when something goes wrong. Tours document rejection, upgrade, and edge-case flows support can replay on calls.',
    icon: Headphones,
  },
  {
    id: 'testers',
    role: 'Testers & QA',
    title: 'Document and verify releases',
    description:
      'Build scenario coverage from captures, then replay tours to confirm new features behave as documented — especially when regressions span multiple steps.',
    icon: Bug,
  },
  {
    id: 'customer-success',
    role: 'Customer success & enablement',
    title: 'Onboard and enable customers at scale',
    description:
      'Ship persona-led tours after go-live so customers learn features on their schedule — adoption playbooks and release highlights without scheduling a call for every scenario.',
    icon: HeartHandshake,
  },
];

export const PRODUCT_TOUR_STRUCTURE_IMAGE = {
  src: getProductTourImageSrc('tour-structure.png'),
  publicPath: `${PRODUCT_TOUR_IMAGE_BASE}/tour-structure.png`,
} as const;

export const PRODUCT_TOUR_LEARNER_IMAGE = {
  src: getProductTourImageSrc('tour-learner.png'),
  publicPath: `${PRODUCT_TOUR_IMAGE_BASE}/tour-learner.png`,
} as const;
