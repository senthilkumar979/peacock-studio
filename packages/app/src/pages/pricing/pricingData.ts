import type { LucideIcon } from 'lucide-react';
import { Gift, HeartHandshake, MessageSquare, Sparkles, Star, Tag } from 'lucide-react';

export type PricingTierCta = 'start-free' | 'talk-to-us' | null;

export interface PricingTier {
  name: string;
  audience: string;
  priceLabel: string;
  highlight?: boolean;
  cta: PricingTierCta;
  features: string[];
}

/** Plans shown as a clear Free / Team / Enterprise comparison during beta. */
export const PRICING_TIERS: PricingTier[] = [
  {
    name: 'Free',
    audience: 'Solo creators documenting their own flows',
    priceLabel: 'Free during beta',
    cta: 'start-free',
    features: [
      'Unlimited local flows',
      'PDF export',
      'Public share links',
      'Cloud sync within free limits',
      'Community support',
    ],
  },
  {
    name: 'Team',
    audience: 'Teams sharing living documentation',
    priceLabel: 'Coming soon',
    highlight: true,
    cta: 'talk-to-us',
    features: [
      'Everything in Free',
      'Roles & permissions',
      'View analytics',
      'Priority support',
      'Custom branding',
    ],
  },
  {
    name: 'Enterprise',
    audience: 'Organizations with security & scale needs',
    priceLabel: 'Coming soon',
    cta: 'talk-to-us',
    features: [
      'Everything in Team',
      'SSO & audit logs',
      'PII detection & retention',
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
    title: 'No surprise bills',
    description: 'Paid plans will launch with clear notice — nothing changes overnight without you seeing it here first.',
  },
  {
    icon: Tag,
    title: 'Founding-user pricing',
    description: 'Early supporters get a discounted annual rate when paid plans launch, below our standard pricing.',
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
    "We're in beta and inviting you to use everything Peacock offers at no cost. When paid plans launch, early adopters keep founding-user pricing below our standard rates.",
  feedbackIcon: MessageSquare,
} as const;
