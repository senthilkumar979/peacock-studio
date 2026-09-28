import type { LucideIcon } from 'lucide-react';
import {
  BarChart3,
  CheckCircle2,
  Cloud,
  FileDown,
  Gift,
  HeartHandshake,
  MessageSquare,
  Share2,
  Sparkles,
} from 'lucide-react';

export interface FreeFeatureGroup {
  name: string;
  description: string;
  icon: LucideIcon;
  features: string[];
}

export const FREE_FEATURE_GROUPS: FreeFeatureGroup[] = [
  {
    name: 'Create',
    description: 'Capture and refine browser workflows.',
    icon: Sparkles,
    features: [
      'Unlimited local flows',
      'Flow Documents and Product Tours',
      'Step titles and descriptions',
      'Screenshot editing',
    ],
  },
  {
    name: 'Share',
    description: 'Publish knowledge in the format your audience needs.',
    icon: Share2,
    features: [
      'Public share links',
      'Embeddable guides',
      'PDF export',
      'Cloud sync across devices',
    ],
  },
  {
    name: 'Understand',
    description: 'Learn how people engage with your documentation.',
    icon: BarChart3,
    features: [
      'Share and embed analytics',
      'PDF export activity',
      'Referral domain insights',
      'Dashboard reporting',
    ],
  },
];

export interface FreePromise {
  icon: LucideIcon;
  title: string;
  description: string;
}

export const FREE_PROMISES: FreePromise[] = [
  {
    icon: Gift,
    title: 'Free to use',
    description: 'Peacock has no subscription fee, paid tier, or feature trial.',
  },
  {
    icon: HeartHandshake,
    title: 'No credit card',
    description: 'Create an account and use the product without entering payment details.',
  },
  {
    icon: Cloud,
    title: 'Cloud included',
    description: 'Sync your work across devices without choosing or upgrading a plan.',
  },
  {
    icon: CheckCircle2,
    title: 'The useful features',
    description: 'Sharing, embeds, exports, and analytics are available without a paywall.',
  },
];

export const FREE_HERO = {
  eyebrowIcon: Gift,
  badge: 'Free for everyone',
  title: 'Everything you need. Free of cost.',
  subtitle:
    'Peacock is free to use with no trial period, paid plan, or credit card required. Capture, publish, and understand your workflows without a pricing decision.',
  feedbackIcon: MessageSquare,
  exportIcon: FileDown,
} as const;
