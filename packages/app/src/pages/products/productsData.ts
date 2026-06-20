import type { LucideIcon } from 'lucide-react';
import { Camera, FileText, Route } from 'lucide-react';

export interface ProductHighlight {
  title: string;
  description: string;
}

export interface Product {
  slug: string;
  name: string;
  shortName: string;
  tagline: string;
  summary: string;
  overview: string;
  highlights: ProductHighlight[];
  idealFor: string[];
  icon: LucideIcon;
  accentGradient: string;
  iconBg: string;
}

export const PRODUCTS: Product[] = [
  {
    slug: 'flow-documents',
    name: 'Flow Documents',
    shortName: 'Flow Documents',
    tagline: 'Execution-grade guides from real product usage.',
    summary:
      'Step-by-step workflow guides with screenshots, sections, branches, and share links — how teams run QA, support, and internal processes.',
    overview:
      'Flow Documents turn live browser workflows into structured, editable references. Record once in the Chrome extension, refine steps and chapters in the flow editor, then publish for async review, guided playback, or PDF export.',
    highlights: [
      {
        title: 'Structured capture',
        description: 'Clicks, inputs, navigation, and screenshots sync into editable steps automatically.',
      },
      {
        title: 'Branches & sections',
        description: 'Link decision paths to other saved docs and divide long guides into navigable chapters.',
      },
      {
        title: 'Share & export',
        description: 'Readonly or editable links, document view, interactive player, and multi-page PDF export.',
      },
    ],
    idealFor: ['QA & regression', 'Support playbooks', 'Internal SOPs', 'Release validation'],
    icon: FileText,
    accentGradient: 'from-peacock-700 to-peacock-900',
    iconBg: 'bg-peacock-50 text-peacock-700',
  },
  {
    slug: 'product-tours',
    name: 'Product Tours',
    shortName: 'Product Tours',
    tagline: 'Adoption narratives composed from multiple demos.',
    summary:
      'Persona-led journeys that bundle saved flow documents into guided stories for onboarding, sales, releases, and executive updates.',
    overview:
      'Product Tours combine multiple captured demos into feature chapters anchored to a buyer or user persona. Present live, share a presenter link, or let prospects explore at their own pace — without rebuilding decks for every audience.',
    highlights: [
      {
        title: 'Persona-led structure',
        description: 'Organize demos by audience so each story stays focused and relevant.',
      },
      {
        title: 'Feature chapters',
        description: 'Group related flow documents into digestible chapters within one tour.',
      },
      {
        title: 'Guided playback',
        description: 'Step-through experience with keyboard navigation and presenter-ready links.',
      },
    ],
    idealFor: ['Sales demos', 'Customer onboarding', 'Release storytelling', 'Enablement'],
    icon: Route,
    accentGradient: 'from-brand-violet to-peacock-800',
    iconBg: 'bg-brand-violet/10 text-brand-violet',
  },
  {
    slug: 'capture-screenshot-editor',
    name: 'Capture Screenshot & Editor',
    shortName: 'Capture & Editor',
    tagline: 'Polished screenshots without leaving the browser.',
    summary:
      'Grab visible, selected, or full-page screenshots from the extension, then crop, blur, redact, and brand them for guides and leave-behinds.',
    overview:
      'Peacock’s capture tools live in the Chrome extension popup — quick screenshots for support, marketing, and documentation assets. Open any capture in the editor to add context, protect sensitive data, and publish professional images ready for flow docs or external channels.',
    highlights: [
      {
        title: 'Flexible capture modes',
        description: 'Visible region, selected region, or entire scrollable page — from any tab.',
      },
      {
        title: 'Privacy-safe editing',
        description: 'Blur and redact regions before screenshots leave your machine.',
      },
      {
        title: 'On-brand polish',
        description: 'Gradient backgrounds, crop, and title or description context for publish-ready assets.',
      },
    ],
    idealFor: ['Support articles', 'Marketing assets', 'Help desk', 'Audit-friendly exports'],
    icon: Camera,
    accentGradient: 'from-slate-800 to-peacock-900',
    iconBg: 'bg-slate-100 text-slate-700',
  },
];

export const getProductBySlug = (slug: string | undefined): Product | undefined =>
  PRODUCTS.find((product) => product.slug === slug);
