import type { LucideIcon } from 'lucide-react';
import { Gift, HeartHandshake, MessageSquare, Sparkles, Star, Tag } from 'lucide-react';

export interface PricingTier {
  name: string;
  audience: string;
  highlight?: boolean;
  features: string[];
}

/** Future tiers shown as a blurred "coming soon" preview during beta. */
export const PRICING_TIERS: PricingTier[] = [
  {
    name: 'Personal',
    audience: 'Solo creators documenting their own flows',
    features: ['Unlimited local flows', 'PDF export', 'Public share links', 'Community support'],
  },
  {
    name: 'Team',
    audience: 'Teams sharing living documentation',
    highlight: true,
    features: [
      'Everything in Personal',
      'Cloud sync & workspaces',
      'Roles & permissions',
      'View analytics',
      'Priority support',
    ],
  },
  {
    name: 'Enterprise',
    audience: 'Organizations with security & scale needs',
    features: [
      'Everything in Team',
      'SSO & audit logs',
      'PII detection & retention',
      'Custom branding',
      'Dedicated support',
    ],
  },
];

export interface BetaPerk {
  icon: LucideIcon;
  title: string;
  description: string;
}

export const BETA_PERKS: BetaPerk[] = [
  {
    icon: Gift,
    title: 'Free during beta',
    description: 'Use every feature at no cost while we polish Peacock with your feedback.',
  },
  {
    icon: HeartHandshake,
    title: 'A personal conversation',
    description: 'Before we ever charge, we will reach out to you individually — no surprise bills.',
  },
  {
    icon: Tag,
    title: 'Founding-user pricing',
    description: 'Early supporters get a discounted annual rate, below our standard pricing.',
  },
  {
    icon: Star,
    title: 'Founding-user badge',
    description: 'Your account is flagged as a founding user — recognition that you were here first.',
  },
];

export const BETA_HERO = {
  eyebrowIcon: Sparkles,
  badge: 'Public Beta',
  title: 'Experience Peacock — free for early adopters',
  subtitle:
    "We're in beta and inviting you to use everything Peacock offers at no cost. When we introduce pricing, we'll contact early adopters personally and honor a founding-user rate below our standard plans.",
  feedbackIcon: MessageSquare,
} as const;
